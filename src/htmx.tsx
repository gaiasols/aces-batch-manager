import { Context } from "hono";
import { FormSettingsDateTitle, FormSettingsModules, SettingsDateTitle, SettingsModules } from "./components";
import { getBatch, getBatchRuntimeInfo } from "./utils";

function htmxError(c: Context, status: number, message?: string) {
	c.status(status);
	return c.body(message || '');
}

export const GET_BatchDateTitle = async (c: Context<{ Bindings: Env }>) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return htmxError(c, 404);
	return c.html(<SettingsDateTitle batch={batch as VBatch} />);
};

export const GET_BatchDateTitleForm = async (c: Context<{ Bindings: Env }>) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return htmxError(c, 404);
	return c.html(<FormSettingsDateTitle batch={batch as VBatch} />);
};

export const POST_BatchDateTitle = async (c: Context<{ Bindings: Env }>) => {
	const db = c.env.DB;
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return htmxError(c, 404);
	const body = await c.req.parseBody();
	const date = body.date as string;
	const title = body.title as string;
	const stm0 = 'UPDATE batches SET date=?, title=? WHERE id=?';
	const stm1 = 'SELECT * FROM v_batches WHERE id=?';
	const rs = await db.batch([db.prepare(stm0).bind(date, title, batch_id), db.prepare(stm1).bind(batch_id)]);
	const updated = rs[1].results[0] as VBatch;
	return c.html(<SettingsDateTitle batch={updated as VBatch} />);
}

export const GET_BatchModules = async (c: Context<{ Bindings: Env }>) => {
	console.log('GET_BatchModules');
	const db = c.env.DB;
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(db, batch_id);
	if (!batch) return htmxError(c, 404);
	const stm = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const rs = await c.env.DB.prepare(stm).bind(batch_id).all();
	const modules = rs.results as VBatchModule[];
	const info = getBatchRuntimeInfo(modules);
	return c.html(<SettingsModules batch={batch} info={info} />);
};

export const GET_BatchModulesForm = async (c: Context<{ Bindings: Env }>) => {
	const db = c.env.DB;
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(db, batch_id);
	if (!batch) return htmxError(c, 404);
	const stm0 = 'SELECT * FROM modules';
	const stm1 = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const rs = await db.batch([
		db.prepare(stm0),
		db.prepare(stm1).bind(batch_id)
	])
	const modules = rs[0].results as Module[];
	const batch_modules = rs[1].results as VBatchModule[]
	const info = getBatchRuntimeInfo(batch_modules);
	return c.html(<FormSettingsModules batch={batch} modules={modules} info={info} />);
};

export const POST_BatchModules = async (c: Context<{ Bindings: Env }>) => {
	const db = c.env.DB;
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(db, batch_id);
	if (!batch) return htmxError(c, 404);
	const body = await c.req.parseBody();
	const type = body.batch_type as string;
	const values: any[] = [];
	if (type == 'ASCENT') {
		if (body.self) values.push({ id: body.self, type: 'SELF', priority: null });
		if (body.case) values.push({ id: body.case, type: 'CASE', priority: null });
		if (body.face) values.push({ id: body.face, type: 'FACE', priority: null });
		if (body.disc) values.push({ id: body.disc, type: 'DISC', priority: null });
	} else {
		const selected = body['module[]'];
		const ids = typeof selected == 'object' ? [...(selected as string[])] : [selected];
		ids.forEach((id) => {
			// id is string with format "XXXX:XXXXXXXX"
			if (id.length) {
				const a = id.split(':');
				values.push({ id: a[2], type: a[1], priority: a[0] });
			}
		});
	}
	const _values = values.map((v) => `(${batch_id}, '${v.id}', '${v.type}', ${v.priority})`).join(',');
	const stm0 = 'DELETE FROM batch_modules WHERE batch_id=?';
	const stm1 = 'INSERT INTO batch_modules (batch_id, module_id, category, priority) VALUES ' + _values;
	await db.batch([db.prepare(stm0).bind(batch_id), db.prepare(stm1)]);
	const stm = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const rs = await c.env.DB.prepare(stm).bind(batch_id).all();
	const modules = rs.results as VBatchModule[];
	const info = getBatchRuntimeInfo(modules);

	return c.html(<SettingsModules batch={batch} info={info} />);
};
