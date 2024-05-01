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
import { GET_AssessorEditor, GET_ModuleEditor, POST_AssessorEditor, POST_ModuleEditor, PUT_AssessorEditor, PUT_ModuleEditor } from "./htmx";

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
	if (!found) return c.html(<LoginForm username={ username } password={ password } />);
	console.log(found);
	// Incorrect password
	const decrypted = await decrypt(found.hash, c);
	if (password != decrypted) return c.html(<LoginForm username={ username } password={ password } />);

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
			<Pojo obj={ names } />
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
			<TableOrgs orgs={ rs.results } />
			{ html`<script>
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
			<td class="pr-2 py-3">{ len }</td>
			<td class="pr-2 py-3">
				<a href={ `/orgs/${org.id}` }>{ org.name }</a>
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
			<TableBatches batches={ batches } />
		</Layout>
	);
});

app.get('/modules', async (c) => {
	const stm = 'SELECT * FROM modules ORDER BY ascent DESC';
	const rs = await c.env.DB.prepare(stm).all();
	const modules = rs.results as AcesModule[];
	
	const idEr = `id${randomToken()}`


	return c.html(
		<Layout>
			<div class="flex items-center gap-4 my-10">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Modul</h1>
				<button class="button bg-blue-600" id="button-form-show">New</button>
			</div>
			<form
				class="module-editor py-5 mb-10"
				hx-post={ `/modules` }
				hx-target={ `table` }
				hx-swap="afterbegin"
				id="form-new"
			>
				<div class="flex gap-5 input-container">
					<div class="w-full">
						<label for="category" class="block text-sm font-medium leading-6 text-gray-900">Category <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<select name="category" id="category" class="w-full">
								<option value="SELF">SELF</option>
								<option value="CASE">CASE</option>
								<option value="FACE">FACE</option>
								<option value="DISC">DISC</option>
							</select>
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="type" class="block text-sm font-medium leading-6 text-gray-900">Type <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="type" id="type" required placeholder="GPQ-01" />
						</div>
					</div>
					<div class="w-full">
						<label for="title" class="block text-sm font-medium leading-6 text-gray-900">Title <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="title" id="title" required />
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-5">
					<div class="w-full flex items-center">
						<div>
							<input type="checkbox" name="ascent" id="ascent" />
						</div>
						<label for="ascent" class="block ml-2 -mt-[2px] text-sm font-medium leading-6 text-gray-900">Assessment Center</label>
					</div>
				</div>
				<div class="flex input-container mt-2 justify-center">
					<span class="text-center text-red-600 font-semibold" id={ idEr }></span>
				</div>
				<div class="flex input-container gap-3 mt-5 justify-end">
					<button type="button" class="button bg-transparent text-black active:bg-transparent" id="button-form-cancel">
						Cancel
					</button>
					<button class="button">Submit</button>
				</div>
			</form>
			<TableModules modules={ modules } />
			{ html`
				<script>
					document.addEventListener("DOMContentLoaded", () => {
						document.getElementById("form-new").addEventListener("htmx:responseError", e => {
							document.getElementById("${idEr}").innerText = e.detail.xhr.responseText
						})
						document.getElementById("button-form-cancel").addEventListener("click", () => {
							document.getElementById("form-new").classList.add("hidden")
							document.getElementById("form-new").reset()
						})
						document.getElementById("button-form-show").addEventListener("click", () => {
							document.getElementById("form-new").classList.remove("hidden")
						})
						document.body.addEventListener("module-inserted", () => {
							document.getElementById("form-new").reset()
							document.getElementById("form-new").classList.add("hidden")
						})
					})
				</script>
			`}
		</Layout>
	);
});

app.get('/assessors', async (c) => {
	const stm = 'SELECT * FROM assessors ORDER BY created DESC';
	const rs = await c.env.DB.prepare(stm).all();

	const idEr = `id${randomToken()}`

	return c.html(
		<Layout>
			<div class="flex items-center gap-4 my-10">
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">Daftar Asesor</h1>
				<button class="button bg-blue-600" id="button-form-show">New</button>
			</div>
			<form
				class="assessor-editor py-5 mb-10 hidden"
				hx-post={ `/assessors` }
				hx-target={ `table` }
				hx-swap="afterbegin"
				id="form-new"
			>
				<div class="flex gap-5 input-container">
					<div class="w-full">
						<label for="fullname" class="block text-sm font-medium leading-6 text-gray-900">Fullname <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="fullname" id="fullname" required />
						</div>
					</div>
					<div class="w-full">
						<label for="username" class="block text-sm font-medium leading-6 text-gray-900">Username <span class="text-red-600">*</span></label>
						<div class="mt-2">
							<input class="w-full" type="text" name="username" id="username" required />
						</div>
					</div>
				</div>
				<div class="flex gap-5 input-container mt-2">
					<div class="w-full">
						<label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email</label>
						<div class="mt-2">
							<input class="w-full" type="email" name="email" id="email" />
						</div>
					</div>
					<div class="w-full">
						<label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
						<div class="mt-2">
							<input class="w-full" type="text" name="password" id="password" />
						</div>
					</div>
				</div>
				<div class="flex input-container mt-2 justify-center">
					<span class="text-center text-red-600 font-semibold" id={ idEr }></span>
				</div>
				<div class="flex input-container gap-3 mt-5 justify-end">
					<button type="button" class="button bg-transparent text-black active:bg-transparent" id="button-form-cancel">
						Cancel
					</button>
					<button class="button">Submit</button>
				</div>
			</form>
			<TableAssessors data={ rs.results } />
			{ html`
				<script>
					document.addEventListener("DOMContentLoaded", () => {
						document.getElementById("form-new").addEventListener("htmx:responseError", e => {
							document.getElementById("${idEr}").innerText = e.detail.xhr.responseText
						})
						document.getElementById("button-form-cancel").addEventListener("click", () => {
							document.getElementById("form-new").classList.add("hidden")
							document.getElementById("form-new").reset()
						})
						document.getElementById("button-form-show").addEventListener("click", () => {
							document.getElementById("form-new").classList.remove("hidden")
						})
						document.body.addEventListener("assessor-inserted", () => {
							document.getElementById("form-new").reset()
							document.getElementById("form-new").classList.add("hidden")
						})
					})
				</script>
			`}
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
				<h1 class="flex-grow text-2xl font-semibold tracking-tight">{ org.name } </h1>
				<PrevNext prev={ prev } next={ next } />
			</div>
			<TableOrgBatches batches={ batches } />
			<FormNewBatch org_id={ org.id } />
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

// htmx
// =============================================================================================
// =============================================================================================

app.post("/assessors", POST_AssessorEditor)
app.get("/assessors/:id_assessor", GET_AssessorEditor)
app.put("/assessors/:id_assessor", PUT_AssessorEditor)

app.post("/modules", POST_ModuleEditor)
app.get("/modules/:id_module", GET_ModuleEditor)
app.put("/modules/:id_module", PUT_ModuleEditor)

app.route('/batches', batch);
export default app;
