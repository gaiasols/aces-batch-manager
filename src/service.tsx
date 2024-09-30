import { Hono } from 'hono';
import { randomToken } from './utils';
import { decrypt } from './crypto';

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

app.get("/batches/:batch_id/person", async c => {
	const id = c.req.param('batch_id');
	const stm = 'SELECT id, fullname FROM v_persons WHERE batch_id=?';
	const persons = await c.env.DB.prepare(stm).bind(id).all();
	return c.json(persons.results);
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
	const decrypted = await decrypt(found.hash as string, c);
	if(decrypted !== password) return c.notFound();

	const stm1 = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const stm2 = 'select * from v_groups where batch_id=? and id=? LIMIT 1';
	const stm3 = 'SELECT * FROM v_batches WHERE id=? LIMIT 1';
	
	const [rs1, rs2, rs3] = await c.env.DB.batch([
		c.env.DB.prepare(stm1).bind(id),
		c.env.DB.prepare(stm2).bind(id, found.group_id),
		c.env.DB.prepare(stm3).bind(id),
	]);
	const modules = rs1.results as VBatchModule[];
	const group = rs2.results.pop() as VGroup;
	const batch = rs3.results.pop() as VBatch;

	console.log(batch)

	return c.json({ 
		user: found, 
		modules: modules.map(v => {
			let slot = null;
			const slots = ["slot1","slot2","slot3","slot4"]
			for (const s of slots) {
				if(group[s as keyof VGroup] === v.module_id) {
					slot = s
					break
				}
			}

			if(!slot) throw new Error('Slot not found')
			return {
				...v,
				slot,
				time_end: batch[`time${slot?.replace('slot','')}_end` as keyof VBatch],
				time_start: batch[`time${slot?.replace('slot','')}` as keyof VBatch],
			}
		})
	});
})

export { app }
