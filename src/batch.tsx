import { Context, Hono } from "hono";
import { AssessorAllocation, BatchHero, BatchLayout, BatchMenu, BatchNeedsRegrouping, BatchRequirements, DaftarPeserta, FormSettingsModules, Pojo, Regroup, SettingsDateTitle, SettingsInfo, SettingsModules, TableGroupSlots, TableGroups, UploadPersonsCSV } from "./components";
import { createParticipants, getAssessorReqs, getBatch, getBatchRuntimeInfo, regroupAscentBatch, regroupCustomBatch } from "./utils";
import { Delete_AssessorListAllocation, GET_AssesorListAllocation, GET_DateTitle, GET_FormDateTitle, GET_FormModules, GET_IndividualSlotAssessorAllocation, GET_Modules, POST_AssessorListAllocation, POST_DateTitle, POST_Modules, PUT_IndividualSlotAssessorAllocation } from "./htmx";
import { Layout } from "./layout";
import { html } from "hono/html";

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
	const prev = batch.prev_id ? `/batches/${batch.prev_id}` : '';
	const next = batch.next_id ? `/batches/${batch.next_id}` : '';
	return c.html(
		<BatchLayout batch={batch} path="/settings">
			<SettingsInfo batch={batch} />
			<SettingsDateTitle batch={batch} />
			<>{info.tokens.length > 0 && <SettingsModules batch={batch} info={info} />}</>
			<>{info.tokens.length == 0 && <FormSettingsModules batch={batch} modules={modules} info={info} />}</>
			<div></div>
			<Pojo obj={info} />
		</BatchLayout>
	);
});

app.post('/:batch_id/persons', async (c) => {
	const id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, id);
	if (!batch) return c.notFound();
	const { batch_id, org_id, num, participants } = await c.req.parseBody();
	if (batch_id != id) {
		c.status(400);
		return c.body('');
	}
	const names = await createParticipants(c, JSON.parse(participants as string));
	const persons = names.map(
		(n, i) => `('${batch_id}-${String(i + 1).padStart(4, '0')}', ${org_id}, ${batch_id}, '${n.name}', '${n.username}', '${n.hash}')`
	);
	console.log('names', names);
	// const names = await randomNamesWithPassword(c, parseInt(num as string));
	// const persons = names.map(
	// 	(n, i) => `('${batch_id}-${String(i + 1).padStart(4, '0')}', ${org_id}, ${batch_id}, '${n.name}', '${n.username}', '${n.hash}')`
	// );
	const stm0 = 'DELETE FROM persons WHERE batch_id=?';
	const stm1 = `INSERT INTO persons (id, org_id, batch_id, fullname, username, hash) VALUES ${persons.join(', ')}`;
	const stm2 = 'UPDATE batches SET regrouping=1 WHERE id=?';
	await c.env.DB.batch([ //
		c.env.DB.prepare(stm0).bind(batch_id),
		c.env.DB.prepare(stm1),
		c.env.DB.prepare(stm2).bind(batch_id),
	]);
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
		<BatchLayout batch={batch} path="/persons">
			<div id="daftar-peserta">
				{persons.length > 0 && <DaftarPeserta persons={persons} />}
				{persons.length == 0 && <UploadPersonsCSV batch={batch} />}
			</div>
		</BatchLayout>
	);
});

// app.get('/:batch_id/assessors', async (c) => {
// 	const batch_id = c.req.param('batch_id');
// 	const batch = await getBatch(c.env.DB, batch_id);
// 	if (!batch) return c.notFound();
// 	const stm = 'SELECT * FROM v_allocs WHERE batch_id=?';
// 	const rs = await c.env.DB.prepare(stm).bind(batch_id).first();

// 	if (!rs || batch.regrouping ) return c.html(<BatchNeedsRegrouping batch={batch} path="/assessors" />);

// 	const alloc = rs as AssessorAllocation;
// 	const req = {
// 		min_disc: Math.max(alloc.disc_slot1, alloc.disc_slot2, alloc.disc_slot3, alloc.disc_slot4),
// 		max_disc: [alloc.disc_slot1, alloc.disc_slot2, alloc.disc_slot3, alloc.disc_slot4].reduce((a, o) => { return a + o }, 0),
// 		min_face: Math.max(alloc.face_slot1_size||0, alloc.face_slot2_size||0, alloc.face_slot3_size||0, alloc.face_slot4_size||0),
// 		max_face: [alloc.face_slot1_size||0, alloc.face_slot2_size||0, alloc.face_slot3_size||0, alloc.face_slot4_size||0].reduce((a, o) => { return a + o; }, 0),
// 	};
// 	return c.html(
// 		<BatchLayout batch={batch} path="/assessors">
// 			<p class="-mb-2">Kebutuhan asesor</p>
// 			<Pojo obj={req} />
// 			<p class="-mb-2">Data v_allocs</p>
// 			<Pojo obj={alloc} />
// 			<Pojo obj={batch} />
// 		</BatchLayout>
// 	);
// });

app.get('/:batch_id/grouping', async (c) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();

	// Batch needs regrouping
	if (batch.regrouping > 0) return c.html(
		<BatchNeedsRegrouping batch={batch} path="/grouping" />
	);

	const stm0 = 'SELECT * FROM v_batch_modules WHERE batch_id=?';
	const stm1 = 'SELECT * FROM v_persons WHERE batch_id=?';
	const stm2 = 'SELECT * FROM v_groups WHERE batch_id=?';
	const db = c.env.DB;
	const rs = await db.batch([ //
		db.prepare(stm0).bind(batch_id),
		db.prepare(stm1).bind(batch_id),
		db.prepare(stm2).bind(batch_id),
	]);
	const modules = rs[0].results as VBatchModule[];
	const persons = rs[1].results as VPerson[];
	const groups = rs[2].results as VGroup[]

	// Not ready for grouping
	if (modules.length == 0 || persons.length == 0) return c.html(
		<BatchLayout batch={batch} path="/grouping">
			<p class="">Belum ada data peserta dan/atau data modul.</p>
		</BatchLayout>
	);

	const info = getBatchRuntimeInfo(modules, batch.id, batch.type, batch.split);
	return c.html(
		<BatchLayout batch={batch} path="/grouping">
			<TableGroupSlots groups={groups} modules={modules} type={batch.type} />
			<TableGroups groups={groups} persons={persons} />
			<Pojo obj={info} />
		</BatchLayout>
	);
});

app.get('/:batch_id/deployment', async (c) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();
	return c.html(
		<BatchLayout batch={batch} path="/deployment">
			<p>Page: Deployment</p>
		</BatchLayout>
	);
});

app.post('/:batch_id/regroup', async (c) => {
	const ref = new URL(c.req.header('referer') as string).pathname;
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return c.notFound();
	const stm0 = 'SELECT * FROM v_batch_modules WHERE batch_id=?';
	const stm1 = 'SELECT * FROM v_persons WHERE batch_id=?';
	const db = c.env.DB;
	const rs = await db.batch([
		//
		db.prepare(stm0).bind(batch_id),
		db.prepare(stm1).bind(batch_id),
	]);
	const modules = rs[0].results as VBatchModule[];
	const persons = rs[1].results as VPerson[];

	const info = getBatchRuntimeInfo(modules, batch.id, batch.type, batch.split);
	if (batch.type == 'ASCENT') await regroupAscentBatch(db, persons, info);
	else await regroupCustomBatch(db, persons, info);

	return c.redirect(ref);
})

app.get('/:batch_id/assessors', async (c: Context<{ Bindings: Env }>) => {
	const id = c.req.param('batch_id');
	const stm0 = `SELECT * FROM v_batches WHERE id=?`;
	const stm1 = `SELECT s.* FROM batches b LEFT JOIN v_allocs s ON b.id=s.batch_id WHERE b.id=?`;
	const stm2 = `SELECT * FROM v_batch_assessors WHERE batch_id=?`;
	const stm3 = `SELECT * FROM assessors`;
	const stm4 = `SELECT * FROM v_persons WHERE batch_id=?`;
	const rs = await c.env.DB.batch([
		/* 0 */ c.env.DB.prepare(stm0).bind(id),
		/* 1 */ c.env.DB.prepare(stm1).bind(id),
		/* 2 */ c.env.DB.prepare(stm2).bind(id),
		/* 3 */ c.env.DB.prepare(stm3),
		/* 4 */ c.env.DB.prepare(stm4).bind(id),
	]);

	if (!rs[0].results.length) return c.notFound();
	const batch = rs[0].results[0] as VBatch;
	if (batch.regrouping > 0) return c.html(<Regroup batch={ batch } />);

	const alloc = rs[1].results[0] as SlotsAlloc;
	const allocated = rs[2].results as VBatchAssessor[];

	const face_assessors = allocated.filter((x) => x.type == 'face');
	const disc_assessors = allocated.filter((x) => x.type == 'disc');

	const { minface, mindisc, maxface, maxdisc } = getAssessorReqs(alloc);
	console.log(alloc)
	const minmax: Minmax = { minface, mindisc, maxface, maxdisc }

	return c.html(
		<Layout title={ `Batch #${batch.id} - Alokasi Asesor` } class="batch">
			<BatchHero batch={ batch } />
			<BatchMenu batch_id={ batch.id } path="/assessors" />
			<div id="daftar-alokasi-assessor">
				{ alloc && <BatchRequirements batch={ batch } alloc={ alloc } /> }
				<AssessorAllocation batch_id={ batch.id } type="disc" minmax={ minmax } title="Asesor Grup" assessors={ disc_assessors } />
				<AssessorAllocation batch_id={ batch.id } type="face" minmax={ minmax } title="Asesor Individu" assessors={ face_assessors } />
				{ html`<script>
					const TESTVAR = 'Badak Bercula';
					const MIN_DISC = ${mindisc};
					const MAX_DISC = ${maxdisc};
					const MIN_F2F = ${minface};
					const MAX_F2F = ${maxface};
					const DISC_ASS_IDS = [${disc_assessors.map((x) => x.ass_id).join(',')}];
					const F2F_ASS_IDS = [${face_assessors.map((x) => x.ass_id).join(',')}];
				</script>`}
				<script src="/asesor.js"></script>
			</div>
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

app.get("/:batch_id/assessors/:type", GET_AssesorListAllocation)
app.post("/:batch_id/assessors/:type", POST_AssessorListAllocation)
app.delete("/:batch_id/assessors/:type", Delete_AssessorListAllocation)
app.get('/:batch_id/assessors/:id/:type', GET_IndividualSlotAssessorAllocation)
app.put('/:batch_id/assessors/:id/:type', PUT_IndividualSlotAssessorAllocation)

export { app };
