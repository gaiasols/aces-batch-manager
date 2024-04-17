import { Hono } from "hono";
import { serveStatic } from 'hono/cloudflare-workers';
import { Layout, XLayout } from "./layout";
import { FormNewBatch, FormNewOrg, LoginForm, Pojo, PrevNext, TableAssessors, TableBatches, TableModules, TableOrgBatches, TableOrgs } from "./components";
import { getSessionUser, randomNamesWithPassword, randomToken } from "./utils";
import { sealData } from "iron-session";
import { deleteCookie, setCookie } from "hono/cookie";
import { decrypt } from "./crypto";
import { html } from "hono/html";
import { app as batch } from "./batch";

const app = new Hono<{ Bindings: Env }>();


app.use('/images/*', serveStatic({ root: './' }));
app.use('/static/*', serveStatic({ root: './' }));
app.use('/asesor.js', serveStatic({ path: './asesor.js' }));
app.use('/styles.css', serveStatic({ path: './styles.css' }));
app.use('*', async (c, next) => {
	const start = Date.now();
	await next();
	const end = Date.now();
	c.res.headers.set('X-Response-Time', `${end - start}`);
});
app.use('*', async (c, next) => {
	const pathname = new URL(c.req.raw.url).pathname;
	const paths = ['/orgs', '/batches', '/modules', '/assessors', '/admin'];
	for (let i = 0; i < paths.length; i++) {
		if (pathname.startsWith(paths[i])) {
			if (!(await getSessionUser(c))) return c.redirect('/');
		}
	}
	await next();
});

app.get('/', async (c) => {
	if (await getSessionUser(c))
		return c.html(
			<Layout>
				<div class="flex items-center gap-4 my-10">
					<h1 class="flex-grow text-2xl font-semibold tracking-tight">Welkomen</h1>
				</div>
				<form method="post" action="/logout">
					<button class="button">Logout</button>
				</form>
			</Layout>
		);
	return c.html(
		<XLayout>
			<LoginForm />
		</XLayout>
	);
})

app.post('/login', async (c) => {
	const body = await c.req.parseBody();
	const username = body.username as string;
	const password = body.password as string;
	const stm = `SELECT * FROM admins WHERE username=?`;
	const found: any = await c.env.DB.prepare(stm).bind(username).first();

	// Not found
	if (!found) return c.html(<LoginForm username={username} password={password} />);
	console.log(found);
	// Incorrect password
	const decrypted = await decrypt(found.hash, c);
	if (password != decrypted) return c.html(<LoginForm username={username} password={password} />);

	// Create cookie
	const user: Admin = {
		id: found.id,
		fullname: found.fullname,
		username: found.username,
		email: found.email,
	};
	const sealedData = await sealData(user, { password: c.env.COOKIE_PASSWORD });
	setCookie(c, c.env.COOKIE_NAME, sealedData, { path: '/' });

	c.status(200);
	c.res.headers.append('HX-Trigger', 'login-ok');
	return c.body('');
});

app.post('/logout', async (c) => {
	deleteCookie(c, c.env.COOKIE_NAME, { path: '/' });
	return c.redirect('/');
});

/*********************/

app.get('/whoami', async (c) => {
	const user = await getSessionUser(c);
	if (!user) return c.text('GUEST');
	return c.json(user);
});

app.get('/names', async (c) => {
	const names = await randomNamesWithPassword(c, 20)
	return c.html(
		<Layout>
			<Pojo obj={names} />
		</Layout>
	);
});

/*********************/

app.get('/orgs', async (c) => {
	const stm = 'SELECT * FROM organizations';
	const rs = await c.env.DB.prepare(stm).all();
	return c.html(
		<Layout>
			<div class="flex items-center gap-4 mt-10 mb-10">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Organisasi</h1>
				<div class="">
					<button id="btn1" class="button-action">
						New Entry
					</button>
					<button id="btn2" class="button-action-stale" style="display:none">
						New Entry
					</button>
				</div>
			</div>
			<FormNewOrg />
			<TableOrgs orgs={rs.results} />
			{html`<script>
				const btn1 = document.getElementById('btn1');
				const btn2 = document.getElementById('btn2');
				const btn3 = document.getElementById('btn3');
				const fcnt = document.getElementById('fcnt');
				const input = document.getElementById('fname');
				btn1.addEventListener('click', () => {
					btn1.style.display = 'none';
					btn2.style.display = 'inline-block';
					fcnt.style.display = 'block';
					input.value = '';
					input.focus();
				});
				btn3.addEventListener('click', () => {
					fcnt.style.display = 'none';
					btn2.style.display = 'none';
					btn1.style.display = 'inline-block';
				});
				document.body.addEventListener('org-added', function () {
					btn3.click();
				});
			</script>`}
		</Layout>
	);
})

app.post('/orgs', async (c) => {
	const body = await c.req.parseBody();
	const name = body.name as string;
	const stm0 = 'INSERT INTO organizations (name) VALUES (?)';
	const stm1 = 'SELECT * FROM organizations ORDER BY id DESC LIMIT 1';
	const stm2 = 'SELECT COUNT(*) AS len FROM organizations';
	const db = c.env.DB;
	const rs = await db.batch([db.prepare(stm0).bind(name), db.prepare(stm1), db.prepare(stm2)]);
	const org = rs[1].results[0] as Organization;
	const len = (rs[2].results[0] as any).len;
	c.res.headers.append('HX-Trigger', 'org-added');
	return c.html(
		<tr class="border-b border-stone-300">
			<td class="pr-2 py-3">{len}</td>
			<td class="pr-2 py-3">
				<a href={`/orgs/${org.id}`}>{org.name}</a>
			</td>
			<td class="pr-2 py-3">xxx</td>
			<td class="py-3 ">xxxxx</td>
		</tr>
	);
})

app.get('/batches', async (c) => {
	const stm = 'SELECT * FROM v_batches';
	const rs = await c.env.DB.prepare(stm).all();
	const batches = rs.results as VBatch[]
	return c.html(
		<Layout>
			<div class="flex items-center gap-4 mt-10 mb-10">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Batch</h1>
			</div>
			<TableBatches batches={batches} />
		</Layout>
	);
});

app.get('/modules', async (c) => {
	const stm = 'SELECT * FROM modules ORDER BY ascent DESC';
	const rs = await c.env.DB.prepare(stm).all();
	const modules = rs.results as AcesModule[];
	return c.html(
		<Layout>
			<div class="flex items-center gap-4 my-10">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Modul</h1>
			</div>
			<TableModules modules={modules} />
		</Layout>
	);
});

app.get('/assessors', async (c) => {
	const stm = 'SELECT * FROM assessors';
	const rs = await c.env.DB.prepare(stm).all();
	return c.html(
		<Layout>
			<div class="flex items-center gap-4 my-10">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Asesor</h1>
			</div>
			<TableAssessors data={rs.results} />
		</Layout>
	);
});

app.get('/orgs/:org_id', async (c) => {
	const org_id = c.req.param('org_id');
	const stm0 = 'SELECT * FROM v_organizations WHERE id=?';
	const stm1 = 'SELECT * FROM v_batches WHERE org_id=?';
	const db = c.env.DB;
	const rs = await db.batch([ //
		db.prepare(stm0).bind(org_id),
		db.prepare(stm1).bind(org_id),
	]);
	if (rs[0].results.length == 0) return c.notFound();
	const org = rs[0].results[0] as unknown as VOrganization;
	const batches = rs[1].results as VBatch[];
	const prev = org.prev_id ? `/orgs/${org.prev_id}` : '';
	const next = org.next_id ? `/orgs/${org.next_id}` : '';
	return c.html(
		<Layout>
			<div class="flex items-center gap-4 mt-10 mb-10">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">{org.name} </h1>
				<PrevNext prev={prev} next={next} />
			</div>
			<TableOrgBatches batches={batches} />
			<FormNewBatch org_id={org.id} />
		</Layout>
	);
})

app.post('/orgs/:org_id', async (c) => {
	const body = await c.req.parseBody();
	const org_id = body.org_id;
	const type = body.type as string;
	const date = body.date as string;
	const title = body.title as string;
	const token = randomToken();
	const stm0 = 'SELECT MAX(id) + 1 AS id FROM batches';
	const db = c.env.DB;
	const rs = (await db.prepare(stm0).first()) as { id: number };
	const id = rs.id;
	const stm1 = 'INSERT INTO batches (id,token,org_id,date,type,title) VALUES (?,?,?,?,?,?)';
	await db.prepare(stm1).bind(id, token, org_id, date, type, title).run();
	return c.redirect(`/batches/${id}`);
})

app.route('/batches', batch);
export default app;
