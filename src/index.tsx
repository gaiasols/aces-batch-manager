import { Hono } from "hono";
import { serveStatic } from 'hono/cloudflare-workers';
import { Layout, XLayout } from "./layout";
import { LoginForm, Pojo } from "./components";
import { randomNamesWithPassword } from "./utils";

const app = new Hono<{ Bindings: Env }>();

app.use('/static/*', serveStatic({ root: './' }));
app.use('/styles.css', serveStatic({ path: './styles.css' }));

app.get('/', async (c) => {
	const x = 0;
	if (x > 0) return c.html(
		<Layout>
			<p>Hono Coroko</p>
		</Layout>
	)
	return c.html(
		<XLayout>
			<LoginForm />
		</XLayout>
	);
})

app.get('/names', async (c) => {
	const names = await randomNamesWithPassword(c, 20)
	return c.html(
		<Layout>
			<Pojo obj={names} />
		</Layout>
	);
});

app.get('/orgs', async (c) => {
	const stm = 'SELECT * FROM organizations';
	const rs = await c.env.DB.prepare(stm).all();
	return c.html(
		<Layout>
			<Pojo obj={rs.results} />
		</Layout>
	);
})

app.get('/batches', async (c) => {
	const stm = 'SELECT * FROM v_batches';
	const rs = await c.env.DB.prepare(stm).all();
	return c.html(
		<Layout>
			<Pojo obj={rs.results} />
		</Layout>
	);
});

app.get('/modules', async (c) => {
	const stm = 'SELECT * FROM modules';
	const rs = await c.env.DB.prepare(stm).all();
	return c.html(
		<Layout>
			<Pojo obj={rs.results} />
		</Layout>
	);
});

app.get('/assessors', async (c) => {
	const stm = 'SELECT * FROM assessors';
	const rs = await c.env.DB.prepare(stm).all();
	return c.html(
		<Layout>
			<Pojo obj={rs.results} />
		</Layout>
	);
});

export default app;
