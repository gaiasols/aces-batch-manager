import { Hono } from "hono";
import { serveStatic } from 'hono/cloudflare-workers';
import { Layout, XLayout } from "./layout";
import { LoginForm } from "./components";

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

export default app;
