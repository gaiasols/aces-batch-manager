import { Hono } from "hono";
import { Layout } from "./layout";
import { BatchHero, BatchMenu, DEV_TableRuntimeInfo, DaftarPeserta, FormSettingsModules, Pojo, SettingsDateTitle, SettingsInfo, SettingsModules, TableGroupSlots, TableGroups, UploadPersonsCSV } from "./components";
import { getBatch, getBatchRuntimeInfo, randomNamesWithPassword } from "./utils";
import { GET_DateTitle, GET_FormDateTitle, GET_FormModules, GET_Modules, POST_DateTitle, POST_Modules, POST_Regroup } from "./htmx";

const app = new Hono<{ Bindings: Env }>();

/**
 * ========== Web Routes
 */

app.get('/:batch_id', async (c) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();
	const stm0 = 'SELECT * FROM v_batch_modules WHERE batch_id=? ORDER BY priority';
	const stm1 = 'SELECT * FROM modules';
	const db = c.env.DB;
	const rs = await db.batch([db.prepare(stm0).bind(batch_id), db.prepare(stm1)])
	const batch_modules = rs[0].results as VBatchModule[]
	const modules = rs[1].results as AcesModule[];
	const info = getBatchRuntimeInfo(batch_modules, batch.id, batch.type);
	return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/settings" />
			<SettingsInfo batch={batch} />
			<SettingsDateTitle batch={batch} />
			<>{info.tokens.length > 0 && <SettingsModules batch={batch} info={info} />}</>
			<>{info.tokens.length == 0 && <FormSettingsModules batch={batch} modules={modules} info={info} />}</>
			<div></div>
			<Pojo obj={info} />
		</Layout>
	);
});

app.post('/:batch_id/persons', async (c) => {
	const id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, id);
	if (!batch) return c.notFound();
	const { batch_id, org_id, num } = await c.req.parseBody();
	if (batch_id != id) {
		c.status(400);
		return c.body('');
	}
	const names = await randomNamesWithPassword(c, parseInt(num as string));
	const persons = names.map(
		(n, i) => `('${batch_id}-${String(i + 1).padStart(4, '0')}', ${org_id}, ${batch_id}, '${n.name}', '${n.username}', '${n.hash}')`
	);
	const stm0 = 'DELETE FROM persons WHERE batch_id=?';
	const stm1 = `INSERT INTO persons (id, org_id, batch_id, fullname, username, hash) VALUES ${persons.join(', ')}`;
	await c.env.DB.batch([c.env.DB.prepare(stm0).bind(batch_id), c.env.DB.prepare(stm1)]);
	return c.redirect(`/batches/${batch_id}/persons`);
});

app.get('/:batch_id/persons', async (c) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();
	const stm0 = 'SELECT * FROM persons WHERE batch_id=?';
	const rs = await c.env.DB.prepare(stm0).bind(batch_id).all();
	const persons = rs.results;
	return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/persons" />
			<div id="daftar-peserta">
				{persons.length > 0 && <DaftarPeserta persons={persons} />}
				{persons.length == 0 && <UploadPersonsCSV batch={batch} />}
			</div>
		</Layout>
	);
});

app.get('/:batch_id/assessors', async (c) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();
	return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/assessors" />
		</Layout>
	);
});

app.get('/:batch_id/grouping', async (c) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();

	// Batch needs regrouping
	if (batch.regrouping > 0) return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/grouping" />
			<div>
				<p class="text-red-500 my-5">Batch ini telah mengalami perubahan yang memerlukan regrouping.</p>
				<button class="button" hx-post={`/batches/${batch.id}/regroup`} hx-target="closest div" hx-swap="innerHTML">
					Regroup Batch
				</button>
			</div>
		</Layout>
	);

	const stm0 = 'SELECT * FROM v_batch_modules WHERE batch_id=?';
	const stm1 = 'SELECT * FROM v_persons WHERE batch_id=?';
	const stm2 = 'SELECT * FROM v_groups WHERE batch_id=?';
	const db = c.env.DB;
	const rs = await db.batch([
		db.prepare(stm0).bind(batch_id),
		db.prepare(stm1).bind(batch_id),
		db.prepare(stm2).bind(batch_id),
	]);
	const modules = rs[0].results as VBatchModule[];
	const persons = rs[1].results as VPerson[];
	const groups = rs[2].results as VGroup[]

	// Not ready for grouping
	if (modules.length == 0 || persons.length == 0) return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/grouping" />
			<p class="">Belum ada data peserta dan/atau data modul.</p>
		</Layout>
	);

	const info = getBatchRuntimeInfo(modules, batch.id, batch.type, batch.split);
	return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/grouping" />
			<DEV_TableRuntimeInfo info={info} persons={persons.length} type={batch.type} />
			<TableGroupSlots groups={groups} modules={modules} type={batch.type} />
			<TableGroups groups={groups} persons={persons} />
			<Pojo obj={info} />
		</Layout>
	);
});

app.get('/:batch_id/deployment', async (c) => {
	const batch_id = c.req.param('batch_id');
	const stm0 = 'SELECT * FROM v_batches WHERE id=?';
	const batch: VBatch | null = await c.env.DB.prepare(stm0).bind(batch_id).first();
	if (!batch) return c.notFound();
	return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/deployment" />
		</Layout>
	);
});

/**
 * ========== HTMX Routes
 */

app.post('/:batch_id/date-title', async (c) => POST_DateTitle(c));

app.get('/:batch_id/date-title', async (c) => GET_DateTitle(c));

app.get('/:batch_id/form-date-title', async (c) => GET_FormDateTitle(c));

app.get('/:batch_id/modules', async (c) => GET_Modules(c));

app.get('/:batch_id/form-modules', async (c) => GET_FormModules(c));

app.post('/:batch_id/modules', async (c) => POST_Modules(c));

app.post('/:batch_id/regroup', async (c) => POST_Regroup(c));

export { app };
