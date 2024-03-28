import { Hono } from "hono";
import { Layout } from "./layout";
import { BatchHero, BatchMenu, DaftarPeserta, FormSettingsModules, Pojo, SettingsDateTitle, SettingsInfo, SettingsModules, UploadPersonsCSV } from "./components";
import { getBatch, getBatchModulesData, randomNamesWithPassword, tokenize } from "./utils";
import { GET_BatchDateTitle, GET_BatchDateTitleForm, GET_BatchModules, GET_BatchModulesForm, POST_BatchDateTitle, POST_BatchModules } from "./htmx";

const app = new Hono<{ Bindings: Env }>();

/**
 * ========== Web Routes
 */

app.get('/:batch_id', async (c) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();
	const { modules, selections } = await getBatchModulesData(c.env.DB, batch_id, batch.type == 'CUSTOM');
	const mod_self = selections.find(x => x.startsWith('SELF'));
	const mod_case = selections.find(x => x.startsWith('CASE'));
	const mod_face = selections.find(x => x.startsWith('FACE'));
	const mod_disc = selections.find((x) => x.startsWith('DISC'));
	const token = tokenize(modules[0]);
	return c.html(
		<Layout>
			<BatchHero batch={batch} />
			<BatchMenu batch_id={batch.id} path="/settings" />
			<SettingsInfo batch={batch} />
			<div>
				<p>token = {token}</p>
				<p>mod_self = {mod_self}</p>
				<p>mod_case = {mod_case}</p>
				<p>mod_face = {mod_face}</p>
				<p>mod_disc = {mod_disc}</p>
			</div>
			<SettingsDateTitle batch={batch} />
			<>{selections.length > 0 && <SettingsModules batch={batch} modules={modules} selections={selections} />}</>
			<>{selections.length == 0 && <FormSettingsModules batch={batch} modules={modules} selections={selections} />}</>
			<Pojo obj={selections} />
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

app.post('/:batch_id/date-title', async (c) => POST_BatchDateTitle(c));

app.get('/:batch_id/date-title', async (c) => GET_BatchDateTitle(c));

app.get('/:batch_id/form-date-title', async (c) => GET_BatchDateTitleForm(c));

app.get('/:batch_id/modules', async (c) => GET_BatchModules(c));

app.get('/:batch_id/form-modules', async (c) => GET_BatchModulesForm(c));

app.post('/:batch_id/modules', async (c) => POST_BatchModules(c));

export { app };
