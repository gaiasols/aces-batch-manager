import { Context } from "hono";
import { FormSettingsDateTitle, FormSettingsModules, Pojo, SettingsDateTitle, SettingsModules } from "./components";
import { getBatch, getBatchRuntimeInfo, regroupAscentBatch, regroupCustomBatch } from "./utils";

function htmxError(c: Context, status: number, message?: string) {
	c.status(status);
	return c.body(message || '');
}

export const GET_DateTitle = async (c: Context<{ Bindings: Env }>) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return htmxError(c, 404);
	return c.html(<SettingsDateTitle batch={batch as VBatch} />);
};

export const GET_FormDateTitle = async (c: Context<{ Bindings: Env }>) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return htmxError(c, 404);
	return c.html(<FormSettingsDateTitle batch={batch as VBatch} />);
};

export const POST_DateTitle = async (c: Context<{ Bindings: Env }>) => {
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

export const GET_Modules = async (c: Context<{ Bindings: Env }>) => {
	console.log('GET_BatchModules');
	const db = c.env.DB;
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(db, batch_id);
	if (!batch) return htmxError(c, 404);
	const stm = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const rs = await c.env.DB.prepare(stm).bind(batch_id).all();
	const modules = rs.results as VBatchModule[];
	const info = getBatchRuntimeInfo(modules, batch.id, batch.type);
	return c.html(<SettingsModules batch={batch} info={info} />);
};

export const GET_FormModules = async (c: Context<{ Bindings: Env }>) => {
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
	const modules = rs[0].results as AcesModule[];
	const batch_modules = rs[1].results as VBatchModule[]
	const info = getBatchRuntimeInfo(batch_modules, batch.id, batch.type);
	return c.html(<FormSettingsModules batch={batch} modules={modules} info={info} />);
};

export const POST_Modules = async (c: Context<{ Bindings: Env }>) => {
	const db = c.env.DB;
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(db, batch_id);
	if (!batch) return htmxError(c, 404, 'Batch not found');

	const form = await c.req.parseBody();
	const type = form.batch_type as string;
	const values: any[] = [];
	if (type == 'ASCENT') { // Batch ASCENT
		if (form.self) values.push({ id: form.self, type: 'SELF', priority: null });
		if (form.case) values.push({ id: form.case, type: 'CASE', priority: null });
		if (form.face) values.push({ id: form.face, type: 'FACE', priority: null });
		if (form.disc) values.push({ id: form.disc, type: 'DISC', priority: null });
	} else { // Batch CUSTOM
		const selected = form['module[]'];
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
	// If batch has persons, UPDATE regrouping status
	const stm2 = batch.persons > 0
		? `UPDATE batches SET regrouping=1 WHERE id=${batch.id}`
		: 'SELECT 0';
	const stm3 = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const rs = await db.batch([
		/* 0 */ db.prepare(stm0).bind(batch_id),
		/* 1 */ db.prepare(stm1),
		/* 2 */ db.prepare(stm2), // update batch
		/* 3 */ db.prepare(stm3).bind(batch_id)
	]);

	const modules = rs[3].results as VBatchModule[];
	const info = getBatchRuntimeInfo(modules, batch.id, batch.type);

	return c.html(<SettingsModules batch={batch} info={info} />);
};

export const POST_Regroup = async (c: Context<{ Bindings: Env }>) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();
	const stm0 = 'SELECT * FROM v_batch_modules WHERE batch_id=?';
	const stm1 = 'SELECT * FROM persons WHERE batch_id=?';
	// const stm2 = 'UPDATE batches SET regrouping=0 WHERE id=?';
	const db = c.env.DB;
	const rs = await db.batch([
		//
		db.prepare(stm0).bind(batch_id),
		db.prepare(stm1).bind(batch_id),
		// db.prepare(stm2).bind(batch_id),
	]);
	const modules = rs[0].results as VBatchModule[];
	const persons = rs[1].results as Person[];

	const info = getBatchRuntimeInfo(modules, batch.id, batch.type, batch.split);
	// regrouping based on batch type
	const groups = batch.type == 'ASCENT'
		? await regroupAscentBatch(db, persons, info)
		: await regroupCustomBatch(db, persons, info);
	return c.html(<Pojo obj={groups} />);
};
