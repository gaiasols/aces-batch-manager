import { Hono } from "hono";
import { serveStatic } from 'hono/cloudflare-workers';

const app = new Hono<{ Bindings: Env }>();

app.use('/static/*', serveStatic({ root: './' }));
app.use('/styles.css', serveStatic({ path: './styles.css' }));

app.get('/', async (c) => {
	return c.html(
		<html>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script
					src="https://unpkg.com/htmx.org@1.9.10"
					integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
					crossorigin="anonymous"
				></script>
				<script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
				<link href="/styles.css" rel="stylesheet" />
			</head>
			<body>
				<div class="max-w-xl mx-auto">
					<h1 class="text-3xl text-center font-medium">Hello Hono</h1>
				</div>
			</body>
		</html>
	);
})

export default app;
