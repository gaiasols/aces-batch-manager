import { Hono } from 'hono';
import { randomToken } from './utils';

const app = new Hono<{ Bindings: Env }>();

// DEV
app.get('/batches', async (c) => {
	const stm0 = 'SELECT id FROM batches';
	const rs = await c.env.DB.prepare(stm0).all();
	const ids = rs.results.map(x => x.id)
	let new_id = randomToken();
	while (ids.includes(new_id)) {
		new_id = randomToken();
	}
	return c.json({ ids, new_id });
})

// DEV
app.get('/batches/:batch_id', async (c) => {
	const id = c.req.param('batch_id');
	const stm0 = 'SELECT * FROM v_batches WHERE id=?';
	const found  = await c.env.DB.prepare(stm0).bind(id).first();
	if (!found) return c.notFound();
	const stm1 = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const rs = await c.env.DB.prepare(stm1).bind(id).all();
	const batch_modules = rs.results as VBatchModule[];
	return c.json({found , batch_modules});
})

app.get('/token/:token', async (c) => {
	const token = c.req.param('token');
	const stm = 'SELECT * FROM v_batches WHERE id=?';
	// const stm = 'SELECT * FROM v_batches WHERE token=?';
	const batch = await c.env.DB.prepare(stm).bind(token).first();
	if (batch) return c.json(batch);
	return c.notFound();
})

app.post('/login', async (c) => {
	const { id, username, password } = await c.req.parseBody();
	console.log(id, username, password);
	const stm0 = 'SELECT * FROM v_persons WHERE batch_id=? AND username=?';
	const found = await c.env.DB.prepare(stm0).bind(id, username).first();
	if (!found) return c.notFound();

	const stm1 = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const rs = await c.env.DB.prepare(stm1).bind(id).all();
	const modules = rs.results as VBatchModule[];
	return c.json({ user: found, modules });
})

export { app }
