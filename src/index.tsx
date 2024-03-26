import { Hono } from "hono";
import { serveStatic } from 'hono/cloudflare-workers';
import { Layout, XLayout } from "./layout";
import { LoginForm, Pojo, TableAssessors, TableBatches, TableModules, TableOrgs } from "./components";
import { getSessionUser, randomNamesWithPassword } from "./utils";
import { sealData } from "iron-session";
import { deleteCookie, setCookie } from "hono/cookie";
import { decrypt } from "./crypto";
import { html } from "hono/html";

const app = new Hono<{ Bindings: Env }>();

app.use('/static/*', serveStatic({ root: './' }));
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
				<div class="flex items-center gap-4 my-8">
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
			<div class="flex items-center gap-4 my-8">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Organisasi</h1>
			</div>
			<TableOrgs orgs={rs.results} />
		</Layout>
	);
})

app.get('/batches', async (c) => {
	const stm = 'SELECT * FROM v_batches';
	const rs = await c.env.DB.prepare(stm).all();
	const batches = rs.results as VBatch[]
	return c.html(
		<Layout>
			<div class="flex items-center gap-4 my-8">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Batch</h1>
			</div>
			<TableBatches batches={batches} />
		</Layout>
	);
});

app.get('/modules', async (c) => {
	const stm = 'SELECT * FROM modules ORDER BY ascent DESC';
	const rs = await c.env.DB.prepare(stm).all();
	const modules = rs.results as Module[];
	return c.html(
		<Layout>
			<div class="flex items-center gap-4 my-8">
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
			<div class="flex items-center gap-4 my-8">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Asesor</h1>
			</div>
			<TableAssessors data={rs.results} />
		</Layout>
	);
});

export default app;
