import { Context } from "hono";
import { AllocationRow, FormAllocationRow, FormSettingsDateTitle, FormSettingsModules, Pojo, SettingsDateTitle, SettingsModules, TableGroupSlots, TableGroups } from "./components";
import { getBatch, getBatchRuntimeInfo, getSlotPosition, regroupAscentBatch, regroupCustomBatch } from "./utils";

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
		const tokens = typeof selected == 'object' ? [...(selected as string[])] : [selected];
		tokens.forEach((token) => {
			// id is string with format "XXXX:XXXXXXXX"
			if (token.length) {
				const splits = token.split('|');
				const priority = splits[0];
				const real_id = splits[1];
				const type = real_id.split(':')[0];
				values.push({ id: real_id, type: type, priority: priority });
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



// ==============================================================================================
// ==============================================================================================
export async function GET_AssesorListAllocation(c: Context<{ Bindings: Env }>) {
	const id = c.req.param('batch_id');
	const type = c.req.param('type');
	if (type != "disc" && type != "face") return c.notFound();
	const filter = type == "disc" ? "face" : "disc";
	const stm0 = `SELECT ass_id FROM batch_assessors WHERE batch_id=? AND type IS ?`;
	const stm1 = `SELECT * FROM assessors`;
	const rs = await c.env.DB.batch([
		/* 0 */ c.env.DB.prepare(stm0).bind(id, filter),
		/* 1 */ c.env.DB.prepare(stm1),
	]);
	const filter_ids = rs[0].results.map((x: any) => x.ass_id);
	const assessors = (rs[1].results as Assessor[]).filter((x) => !filter_ids.includes(x.id));

	const onclick = `document.getElementById("${type}-assessors-bucket").innerHTML="";
	document.querySelectorAll(".bucket-loader").forEach((b) => b.removeAttribute("disabled"))
	document.getElementById("${type}-load-bucket").style.display="block";`;
	c.res.headers.append('HX-Trigger', `{"bucket-loaded":{"loader": "${type}-load-bucket", "type":"${type}"}}`);

	return c.html(
		<div>
			<div class="grid grid-cols-2 h-[150px] overflow-y-auto border rounded-lg mt-5">
				{ assessors.map((a) => (
					<form class="p-0 m-0" hx-post={ `/batches/${id}/assessors/${type}` } hx-target={ `#${type}-assessors-tray` } hx-swap="beforeend">
						<input type="hidden" name="type" value={ type } />
						<input type="hidden" name="ass_id" value={ a.id } />
						<p id={ `A-${a.id}` } ass_id={ a.id } class="cursor-default py-3 px-5 bucket-item">
							{ a.fullname }
						</p>
						<button style="display:none" />
					</form>
				)) }
			</div>
			<button class="mt-5 button-action py-3" onclick={ onclick }>CLOSE BUCKET</button>
		</div>
	);
}

export async function POST_AssessorListAllocation(c: Context<{ Bindings: Env }>) {
	async function getGroupingsToUpdate(batch_id: string) {
		const groups = await c.env.DB.prepare(`SELECT * FROM v_groups WHERE batch_id=?`).bind(batch_id).all();
		const groupFacePosition = (groups.results as unknown as VGroup[])
			.reduce((acc, curr) => {
				if (curr.slot1.includes("FACE")) {
					acc[1] = [...new Set([...acc[1], `"${curr.id}"`])]
				}
				if (curr.slot2.includes("FACE")) {
					acc[2] = [...new Set([...acc[2], `"${curr.id}"`])]
				}
				if (curr.slot3.includes("FACE")) {
					acc[3] = [...new Set([...acc[3], `"${curr.id}"`])]
				}
				if (curr.slot4.includes("FACE")) {
					acc[4] = [...new Set([...acc[4], `"${curr.id}"`])]
				}
				return acc
			}, { 1: [], 2: [], 3: [], 4: [] } as Record<number, string[]>)


		return (await c.env.DB.batch(Object.values(groupFacePosition)
			.map((v) => {
				const stm = `SELECT group_id, person_id FROM groupings WHERE batch_id = ? AND group_id IN (${v.join(",")}) AND face_ass_id IS NULL LIMIT 1`
				return c.env.DB.prepare(stm).bind(batch_id)
			})))
			.map((v, i) => {
				const curr = v.results.pop() as { person_id: string; group_id: string }
				if (!curr) return null
				if (!curr?.group_id) return null
				if (!curr?.person_id) return null
				return {
					group_id: curr.group_id,
					person_id: curr.person_id,
				}
			})
			.filter((v: any) => !!v)
	}

	const batch_id = c.req.param('batch_id');
	const body = await c.req.parseBody();
	const type = body.type as string;
	const ass_id = parseInt(body.ass_id as string);
	const groupingsToUpdate: any[] = type !== 'disc' ? (await getGroupingsToUpdate(batch_id)) : []

	const stm0 = `INSERT INTO batch_assessors (batch_id,ass_id,type) VALUES (?,?,?)`;
	const stm1 = `SELECT * FROM v_batch_assessors WHERE batch_id=? AND ass_id=? AND type=?`;
	const rs = await c.env.DB.batch([
		/* 0 */ c.env.DB.prepare(stm0).bind(batch_id, ass_id, type),
		/* 1 */ c.env.DB.prepare(stm1).bind(batch_id, ass_id, type),
		// /* 1 */ c.env.DB.prepare("SELECT * FROM groups")
		...groupingsToUpdate.map(v => {
			return c.env.DB
				.prepare("UPDATE groupings SET face_ass_id = ? WHERE group_id = ? AND person_id = ? AND batch_id = ?")
				.bind(ass_id, v?.group_id, v?.person_id, batch_id)
		})
	]);
	// console.log(rs[2])
	const asesor = rs[1].results[0] as VBatchAssessor;
	const json = JSON.stringify({ type: asesor.type, ass_id: asesor.ass_id })
	c.res.headers.append('HX-Trigger', `{"assessor-saved" : ${json}}`);
	return c.html(<AllocationRow assessor={ asesor } type={ type as 'disc' | 'face' } />);
};

export async function Delete_AssessorListAllocation(c: Context<{ Bindings: Env }>) {
	async function getGroupingsToUpdate(ass_id: number, batch_id: string) {
		const stm = `SELECT group_id, person_id FROM groupings WHERE face_ass_id = ? AND batch_id = ?`
		return (await c.env.DB.prepare(stm).bind(ass_id, batch_id).all()).results
	}

	const batch_id = c.req.param('batch_id');
	const body = await c.req.parseBody();
	const ass_id = parseInt(body.ass_id as string);
	const type = body.type as string;
	const groupingsToUpdate = await getGroupingsToUpdate(ass_id, batch_id)

	const stm0 = `DELETE FROM batch_assessors WHERE batch_id=? AND ass_id=?`;
	await c.env.DB.batch([
		c.env.DB.prepare(stm0).bind(batch_id, ass_id),
		...groupingsToUpdate.map(v => {
			return c.env.DB.prepare("UPDATE groupings SET face_ass_id = ? WHERE group_id = ? AND person_id = ? AND batch_id = ?")
				.bind(null, v?.group_id, v?.person_id, batch_id)
		})
	]);

	const json = JSON.stringify({ ass_id, type });
	c.res.headers.append('HX-Trigger', `{"assessor-dropped" : ${json}}`);
	return c.body('');
};

export async function GET_IndividualSlotAssessorAllocation(c: Context<{ Bindings: Env }>) {
	const form = c.req.query('form');
	const type = c.req.param('type');
	const ass_id = c.req.param('id');
	const batch_id = c.req.param('batch_id');

	const stm0 = `SELECT * FROM v_batch_assessors WHERE batch_id=? AND ass_id=? AND type=?`;
	const found = (await c.env.DB.prepare(stm0).bind(batch_id, ass_id, type).first()) as VBatchAssessor;

	if (!found) {
		c.status(404);
		return c.body('');
	}

	if (form !== undefined) return c.html(<FormAllocationRow assessor={ found } type={ type } />);
	return c.html(<AllocationRow assessor={ found } type={ type as 'disc' | 'face' } />);
}

export async function PUT_IndividualSlotAssessorAllocation(c: Context<{ Bindings: Env }>) {
	async function getToUpdateGroupings(vAll: number[], ass_id: string, batch_id: string): Promise<{ toNull: any[], toFill: any[] }> {
		type groupings = { group_id: string, person_id: string, face_ass_id: string | null }
		type groupingsObject = Record<string, groupings>

		const groupFacePosition = await getSlotPosition(c.env.DB, batch_id);
		const groupFacePositionToFill = vAll.reduce((acc, curr, i) => {
			if (curr == 1) {
				const arr = [] as string[]

				Object.entries(groupFacePosition).forEach(e => {
					if (e[1] == i + 1) {
						arr.push(e[0])
					}
				})

				acc[`${i + 1}`] = arr
			}
			return acc
		}, {} as Record<string, string[]>)
		const groupFacePositionToFillFlat = Object.values(groupFacePositionToFill).flat().map(v => `"${v}"`).join(",")


		// // prepare to get latest groupings
		const stm1 = c.env.DB.prepare('SELECT group_id, face_ass_id, person_id FROM groupings WHERE batch_id = ? AND face_ass_id = ?').bind(batch_id, ass_id)
		// // prepare to get groupings with f2f_ass is empty in all position [1,2,3,4]
		const stm2 = c.env.DB.prepare(`SELECT DISTINCT group_id, face_ass_id, person_id FROM groupings WHERE batch_id = ? AND face_ass_id IS NULL AND group_id IN (${groupFacePositionToFillFlat}) GROUP BY group_id`).bind(batch_id)


		// // get exec batch query
		const [latest, empty] = await c.env.DB.batch([
			stm1,
			stm2
		]) as unknown as { results: groupings[] }[]

		const toNull = latest.results
		const toFill = Object
			.values(vAll.reduce((acc, curr, i) => {
				if (curr == 1) {
					Object.entries(groupFacePosition).forEach(e => {
						if (e[1] == i + 1 && !acc[`${i + 1}`]) {
							// @ts-ignore
							acc[`${i + 1}`] = empty.results.find(x => x.group_id == e[0])
						}
					})
				}
				return acc
			}, {} as groupingsObject))

		return {
			toNull: toNull
				.filter(v => !toFill.find(x => x.group_id === v.group_id))
				.map(v => {
					return c.env.DB.prepare("UPDATE groupings SET face_ass_id = ? WHERE group_id = ? AND person_id = ? AND batch_id = ?")
						.bind(null, v.group_id, v.person_id, batch_id)
				}),
			toFill: toFill
				.filter(v => !toNull.find(x => x.group_id === v.group_id))
				.map(v => {
					return c.env.DB.prepare("UPDATE groupings SET face_ass_id = ? WHERE group_id = ? AND person_id = ? AND batch_id = ?")
						.bind(id, v.group_id, v.person_id, batch_id)
				}),
		}
	}

	async function getToUpdateGroups(vAll: number[], ass_id: string, batch_id: string): Promise<{ toNull: any[], toFill: any[] }> {
		type groups = { id: string, ass_id: string | null }

		const groupDiscPosition = await getSlotPosition(c.env.DB, batch_id, "DISC");

		const latest = await c.env.DB.prepare('SELECT id, ass_id FROM groups WHERE batch_id = ? AND ass_id = ?').bind(batch_id, ass_id).all()
		const toNull = Object.values((latest.results as groups[]).reduce((acc, curr, i) => {
			if(vAll[groupDiscPosition[curr.id] - 1] == 0) {
				acc[curr.id] = curr
			}
			return acc
		}, {} as Record<string, groups>))

		return {
			toNull: toNull
				.map(v => {
					return c.env.DB.prepare("UPDATE groups SET ass_id = ? WHERE id = ?  AND batch_id = ?")
						.bind(null, v.id, batch_id)
				}),
			toFill: []
		}
	}

	const { batch_id, id, type } = c.req.param();
	const { slot1, slot2, slot3, slot4 } = await c.req.parseBody();
	const v1 = slot1 ? 1 : 0;
	const v2 = slot2 ? 1 : 0;
	const v3 = slot3 ? 1 : 0;
	const v4 = slot4 ? 1 : 0;
	const vAll = [v1, v2, v3, v4]

	const { toNull, toFill } = type === 'face'
		? await getToUpdateGroupings(vAll, id, batch_id)
		: await getToUpdateGroups(vAll, id, batch_id)

	const stm0 = `UPDATE batch_assessors SET slot1=?, slot2=?, slot3=?, slot4=? WHERE batch_id=? AND ass_id=?`;
	await c.env.DB.batch([
		c.env.DB.prepare(stm0).bind(v1, v2, v3, v4, batch_id, id),
		...toNull,
		...toFill,
	]);


	const stm1 = `SELECT * FROM v_batch_assessors WHERE batch_id=? AND ass_id=?`;
	const found = (await c.env.DB.prepare(stm1).bind(batch_id, id).first()) as VBatchAssessor;

	if (!found) {
		c.status(404);
		return c.body('');
	}

	return c.html(<AllocationRow type={ type as 'disc' | 'face' } assessor={ found } />);
}