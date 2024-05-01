import { Context } from "hono";
import { AllocationRow, AssessorEditor, AssessorRow, FormAllocationRow, FormSettingsDateTitle, FormSettingsModules, ModuleEditor, ModulesRow, PairingF2FAssessorWithParticipant, PairingGroupAssessorWithParticipant, PersonEditor, Pojo, RowPeserta, SettingsDateTitle, SettingsModules, TableGroupSlots, TableGroups } from "./components";
import { getBatch, getBatchRuntimeInfo, getSlotPosition, randomToken, regroupAscentBatch, regroupCustomBatch } from "./utils";
import { encrypt } from "./crypto";

function htmxError(c: Context, status: number, message?: string) {
	c.status(status);
	return c.body(message || '');
}

export const GET_DateTitle = async (c: Context<{ Bindings: Env }>) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return htmxError(c, 404);
	return c.html(<SettingsDateTitle batch={ batch as VBatch } />);
};

export const GET_FormDateTitle = async (c: Context<{ Bindings: Env }>) => {
	const batch_id = c.req.param('batch_id');
	const batch = await getBatch(c.env.DB, batch_id);
	if (!batch) return htmxError(c, 404);
	return c.html(<FormSettingsDateTitle batch={ batch as VBatch } />);
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
	return c.html(<SettingsDateTitle batch={ updated as VBatch } />);
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
	return c.html(<SettingsModules batch={ batch } info={ info } />);
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
	return c.html(<FormSettingsModules batch={ batch } modules={ modules } info={ info } />);
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

	return c.html(<SettingsModules batch={ batch } info={ info } />);
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

	async function getGroupsToUpdate(batch_id: string) {
		const groups = await c.env.DB.prepare(`SELECT * FROM groups WHERE batch_id=?`).bind(batch_id).all();
		const groupDiscPosition = (groups.results as unknown as VGroup[])
			.reduce((acc, curr) => {
				if (curr.slot1.includes("DISC")) {
					acc[1] = [...new Set([...acc[1], `"${curr.id}"`])]
				}
				if (curr.slot2.includes("DISC")) {
					acc[2] = [...new Set([...acc[2], `"${curr.id}"`])]
				}
				if (curr.slot3.includes("DISC")) {
					acc[3] = [...new Set([...acc[3], `"${curr.id}"`])]
				}
				if (curr.slot4.includes("DISC")) {
					acc[4] = [...new Set([...acc[4], `"${curr.id}"`])]
				}
				return acc
			}, { 1: [], 2: [], 3: [], 4: [] } as Record<number, string[]>)


		return (await c.env.DB.batch(Object.values(groupDiscPosition)
			.map((v) => {
				const stm = `SELECT id FROM groups WHERE batch_id = ? AND id IN (${v.join(",")}) AND ass_id IS NULL LIMIT 1`
				return c.env.DB.prepare(stm).bind(batch_id)
			})))
			.map((v, i) => {
				const curr = v.results.pop() as { id: string }
				if (!curr) return null
				if (!curr?.id) return null
				return {
					id: curr.id
				}
			})
			.filter((v: any) => !!v)
	}

	const batch_id = c.req.param('batch_id');
	const body = await c.req.parseBody();
	const type = body.type as string;
	const ass_id = parseInt(body.ass_id as string);

	const groupingsToUpdate = await getGroupingsToUpdate(batch_id)
	const groupsToUpdate = await getGroupsToUpdate(batch_id)

	const stm0 = `INSERT INTO batch_assessors (batch_id,ass_id,type) VALUES (?,?,?)`;
	const stm1 = `SELECT * FROM v_batch_assessors WHERE batch_id=? AND ass_id=? AND type=?`;
	const rs = await c.env.DB.batch([
		/* 0 */ c.env.DB.prepare(stm0).bind(batch_id, ass_id, type),
		/* 1 */ c.env.DB.prepare(stm1).bind(batch_id, ass_id, type),
		// /* 1 */ c.env.DB.prepare("SELECT * FROM groups")
		...(type === 'face'
			? groupingsToUpdate.map(v => {
				return c.env.DB
					.prepare("UPDATE groupings SET face_ass_id = ? WHERE group_id = ? AND person_id = ? AND batch_id = ?")
					.bind(ass_id, v?.group_id, v?.person_id, batch_id)
			})
			: groupsToUpdate.map(v => {
				return c.env.DB
					.prepare("UPDATE groups SET ass_id = ? WHERE id = ? AND batch_id = ?")
					.bind(ass_id, v?.id, batch_id)
			}))
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
		...(type === 'face'
			? groupingsToUpdate.map(v => {
				return c.env.DB.prepare("UPDATE groupings SET face_ass_id = ? WHERE group_id = ? AND person_id = ? AND batch_id = ?")
					.bind(null, v?.group_id, v?.person_id, batch_id)
			})
			: [c.env.DB.prepare("UPDATE groups SET ass_id = ? WHERE ass_id = ? AND batch_id = ?").bind(null, ass_id, batch_id)])
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
							const curr = empty.results.find(x => x.group_id == e[0])
							if (curr) {
								acc[`${i + 1}`] = curr
							}
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
		type groupsObject = Record<string, groups>

		const groupDiscPosition = await getSlotPosition(c.env.DB, batch_id, "DISC");
		const groupDiscPositionToFill = vAll.reduce((acc, curr, i) => {
			if (curr == 1) {
				const arr = [] as string[]

				Object.entries(groupDiscPosition).forEach(e => {
					if (e[1] == i + 1) {
						arr.push(e[0])
					}
				})

				acc[`${i + 1}`] = arr
			}
			return acc
		}, {} as Record<string, string[]>)
		const groupDiscPositionToFillFlat = Object.values(groupDiscPositionToFill).flat().map(v => `"${v}"`).join(",")

		const [latest, empty] = await c.env.DB.batch([
			c.env.DB.prepare('SELECT id, ass_id FROM groups WHERE batch_id = ? AND ass_id = ?').bind(batch_id, ass_id),
			c.env.DB.prepare(`SELECT id, ass_id FROM groups WHERE batch_id = ? AND ass_id IS NULL AND id IN (${groupDiscPositionToFillFlat})`).bind(batch_id)
		])


		const toNull = Object.values((latest.results as groups[]).reduce((acc, curr, i) => {
			if (vAll[groupDiscPosition[curr.id] - 1] == 0) {
				acc[curr.id] = curr
			}
			return acc
		}, {} as Record<string, groups>))
		const toFill = Object
			.values(vAll.reduce((acc, curr, i) => {
				if (curr == 1) {
					const pos = groupDiscPositionToFill[`${i + 1}`]
					const isLatestInPosition = pos.find(x => (latest.results as groups[]).find(y => y.id == x))
					if (!isLatestInPosition) {
						Object.entries(groupDiscPosition).forEach(e => {
							if (e[1] == i + 1 && !acc[`${i + 1}`]) {
								// @ts-ignore
								const curr = empty.results.find(x => x.id == e[0])
								if (curr) {
									// @ts-ignore
									acc[`${i + 1}`] = curr
								}
							}
						})
					}
				}
				return acc
			}, {} as groupsObject))

		return {
			toNull: toNull
				.map(v => {
					return c.env.DB.prepare("UPDATE groups SET ass_id = ? WHERE id = ? AND batch_id = ?")
						.bind(null, v.id, batch_id)
				}),
			toFill: toFill
				.filter(v => !toNull.find(x => x.id === v.id))
				.map(v => {
					return c.env.DB.prepare("UPDATE groups SET ass_id = ? WHERE id = ? AND batch_id = ?")
						.bind(ass_id, v.id, batch_id)
				}),
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



// ===================================================================================================================
// ===================================================================================================================
export async function GET_PersonEditor(c: Context<{ Bindings: Env }>) {
	const isForm = c.req.query('form')
	const personId = c.req.param('person_id')

	if (isForm === undefined) return c.html("")

	const person = await c.env.DB.prepare("SELECT * FROM persons WHERE id = ?").bind(personId).first()
	if (!person) return c.text("not found", 404)

	return c.html(<PersonEditor person={ person as Person } />)
}

export async function PUT_PersonEditor(c: Context<{ Bindings: Env }>) {
	type DataWithPassword = {
		nip: string,
		fullname: string,
		username: string,
		jenis_kelamin: string,
		password: string,
	}

	type DataNoPassword = {
		nip: string,
		fullname: string,
		username: string,
		jenis_kelamin: string,
	}

	async function updateWithPassword(data: DataWithPassword, personId: string) {
		const hash = await encrypt(data.password ?? randomToken(), c);
		await c.env.DB
			.prepare('UPDATE persons SET fullname = ?, username = ?, nip = ?, jenis_kelamin = ?, hash = ? WHERE id = ?')
			.bind(data.fullname, data.username, data.nip, data.jenis_kelamin, hash, personId)
			.run()
	}

	async function updateNoPassword(data: DataNoPassword, personId: string) {
		await c.env.DB
			.prepare('UPDATE persons SET fullname = ?, username = ?, nip = ?, jenis_kelamin = ? WHERE id = ?')
			.bind(data.fullname, data.username, data.nip, data.jenis_kelamin, personId)
			.run()
	}


	const body = (await c.req.parseBody()) as unknown as DataNoPassword & { password?: string }

	const personId = c.req.param('person_id')
	const batchId = c.req.param('batch_id') as unknown as number

	if (!["perempuan", "pr", "laki-laki", "lk"].includes(body.jenis_kelamin.trim().toLocaleLowerCase())) return c.html("Jenis kelamin tidak valid", 400)

	const [uname, nip] = await c.env.DB.batch([
		c.env.DB.prepare("SELECT id FROM persons WHERE username = ? AND id IS NOT ?").bind(body.username, personId),
		c.env.DB.prepare("SELECT id FROM persons WHERE nip = ? AND id IS NOT ?").bind(body.nip, personId),
	])

	if (uname.results.length > 0) return c.html("Username is not available", 400)
	if (nip.results.length > 0) return c.html("NIP is not available", 400)

	if (body?.password) {
		await updateWithPassword(body as unknown as DataWithPassword, personId)
	} else {
		await updateNoPassword(body as unknown as DataNoPassword, personId)
	}
	return c.html(
		<RowPeserta
			nip={ body.nip }
			person_id={ personId }
			batch_id={ batchId }
			username={ body.username }
			fullname={ body.fullname }
			jenis_kelamin={ body.jenis_kelamin }
		/>
	)
}



// ===============================================================================================================================
// ===============================================================================================================================

export async function DELETE_PersonEditor(c: Context<{ Bindings: Env }>) {
	const batchId = c.req.param('batch_id')
	const personId = c.req.param('person_id')

	const stm1 = `DELETE FROM persons WHERE id=? AND batch_id=?`;
	const stm2 = 'UPDATE batches SET regrouping=1 WHERE id=?';

	await c.env.DB.batch([
		c.env.DB.prepare(stm1).bind(personId, batchId),
		c.env.DB.prepare(stm2).bind(batchId)
	])
	return c.html("")
}

export async function PUT_DISCAssessorParticipantPairing(c: Context<{ Bindings: Env }>) {
	const x = await c.req.parseBody();
	const groupId = c.req.param('group_id')
	const batchId = c.req.param('batch_id');

	// update
	await c.env.DB.prepare(`UPDATE groups SET ass_id = ? WHERE id = ?`).bind(Object.values(x).pop(), groupId).run()

	// get updated data

	const stm0 = `SELECT * FROM v_groups WHERE batch_id=?`;
	const stm1 = `SELECT * FROM v_batch_assessors WHERE type='disc' AND batch_id=?`;
	const rs = await c.env.DB.batch([
		/* 0 */ c.env.DB.prepare(stm0).bind(batchId),
		/* 1 */ c.env.DB.prepare(stm1).bind(batchId),
	]);
	const groups = rs[0].results as VGroup[];
	const list = rs[1].results as VBatchAssessor[];

	return c.html(<PairingGroupAssessorWithParticipant vGroups={ groups } VBatchAssessor={ list } />)
}

export async function PUT_FACEAssessorParticipantPairing(c: Context<{ Bindings: Env }>) {
	const x = await c.req.parseBody();
	const batchId = c.req.param('batch_id');
	const personId = c.req.param('person_id')

	// update
	await c.env.DB.prepare(`UPDATE groupings SET face_ass_id = ? WHERE batch_id = ? AND person_id = ?`).bind(x?.ass_id ?? null, batchId, personId).run()

	// get updated data

	const stm0 = `SELECT * FROM v_persons WHERE batch_id=?`;
	const stm1 = `SELECT * FROM v_batch_assessors WHERE type='face' AND batch_id=?`;
	const rs = await c.env.DB.batch([
		/* 0 */ c.env.DB.prepare(stm0).bind(batchId),
		/* 1 */ c.env.DB.prepare(stm1).bind(batchId),
	]);

	const groupFacePosition = await getSlotPosition(c.env.DB, batchId)

	return c.html(
		<PairingF2FAssessorWithParticipant
			vPersons={ rs[0].results as VPerson[] }
			VBatchAssessor={ rs[1].results as VBatchAssessor[] }
			groupFacePosition={ groupFacePosition }
		/>
	)
}

export async function GET_AssessorEditor(c: Context<{ Bindings: Env }>) {
	const isForm = c.req.query('form')
	const assessorId = c.req.param('id_assessor')

	if (isForm === undefined) return c.html("")

	const assesor = await c.env.DB.prepare("SELECT * FROM assessors WHERE id = ?").bind(assessorId).first()
	if (!assesor) return c.text("not found", 404)

	return c.html(<AssessorEditor assessor={ assesor as Assessor } />)
}

export async function PUT_AssessorEditor(c: Context<{ Bindings: Env }>) {
	type DataWithPassword = {
		email: string,
		fullname: string,
		username: string,
		password: string,
	}

	type DataNoPassword = {
		email: string,
		fullname: string,
		username: string,
	}

	async function updateWithPassword(data: DataWithPassword, assessorId: string) {
		const hash = await encrypt(data.password ?? randomToken(), c);
		await c.env.DB
			.prepare('UPDATE assessors SET fullname = ?, username = ?, email = ?, hash = ? WHERE id = ?')
			.bind(data.fullname, data.username, data.email, hash, assessorId)
			.run()
	}

	async function updateNoPassword(data: DataNoPassword, assessorId: string) {
		await c.env.DB
			.prepare('UPDATE assessors SET fullname = ?, username = ?, email = ? WHERE id = ?')
			.bind(data.fullname, data.username, data.email, assessorId)
			.run()
	}


	const body = (await c.req.parseBody()) as unknown as DataNoPassword & { password?: string }

	const assessorId = c.req.param('id_assessor')

	const [uname, email] = await c.env.DB.batch([
		c.env.DB.prepare("SELECT id FROM assessors WHERE username = ? AND id IS NOT ?").bind(body.username, assessorId),
		c.env.DB.prepare("SELECT id FROM assessors WHERE email = ? AND id IS NOT ?").bind(body.email, assessorId),
	])

	console.log(body)

	if (uname.results.length > 0) return c.html("Username is not available", 400)
	if (email.results.length > 0) return c.html("Email is not available", 400)
	
	if (body?.password) {
		await updateWithPassword(body as unknown as DataWithPassword, assessorId)
	} else {
		await updateNoPassword(body as unknown as DataNoPassword, assessorId)
	}

	return c.html(
		<AssessorRow
			assessor={ {
				hash: "",
				id: assessorId,
				email: body?.email,
				username: body.username,
				fullname: body.fullname
			} as unknown as Assessor }
		/>
	)
}

export async function POST_AssessorEditor(c: Context<{ Bindings: Env }>) {
	type DataWithPassword = {
		fullname: string,
		username: string,
		email?: string,
		password?: string,
	}

	async function insertData(data: DataWithPassword, assessorId: number) {
		const hash = data?.password 
			? await encrypt(data?.password ?? randomToken(), c)
			: null;

		if(data.email) {
			await c.env.DB
				.prepare('INSERT INTO assessors (id, fullname, username, email, hash) VALUES (?,?,?,?,?)')
				.bind(assessorId, data.fullname, data.username, data.email, hash ?? null)
				.run()
		} else {
			await c.env.DB
				.prepare('INSERT INTO assessors (id, fullname, username, hash) VALUES (?,?,?,?)')
				.bind(assessorId, data.fullname, data.username, hash ?? null)
				.run()
		}
		
	}


	const body = (await c.req.parseBody()) as unknown as DataWithPassword

	const [id, uname, email] = await c.env.DB.batch([
		c.env.DB.prepare("SELECT MAX(id) as id FROM assessors"),
		c.env.DB.prepare("SELECT id FROM assessors WHERE username = ?").bind(body.username),
		...(body.email ? [c.env.DB.prepare("SELECT id FROM assessors WHERE email = ?").bind(body.email)] : []), 
	])

	const assessorId = (id.results[0] as { id: number }).id as unknown as number + 1

	if (uname.results.length > 0) return c.html("Username is not available", 400)
	if (email && email.results.length > 0) return c.html("Email is not available", 400)
	await insertData(body as unknown as DataWithPassword, assessorId)

	c.res.headers.append('HX-Trigger', `{"assessor-inserted": {}}`);

	return c.html(
		<AssessorRow
			assessor={ {
				hash: "",
				id: assessorId,
				email: body?.email,
				username: body.username,
				fullname: body.fullname
			} as unknown as Assessor }
		/>
	)
}

export async function GET_ModuleEditor(c: Context<{ Bindings: Env }>) {
	const isForm = c.req.query('form')
	const moduleId = c.req.param('id_module')

	if (isForm === undefined) return c.html("")

	const mod = await c.env.DB.prepare("SELECT * FROM modules WHERE id = ?").bind(moduleId).first()
	if (!mod) return c.text("not found", 404)

	return c.html(<ModuleEditor mod={ mod as AcesModule } />)
}

export async function PUT_ModuleEditor(c: Context<{ Bindings: Env }>) {
	type Data = {
		category: string,
		type: string,
		title: string,
		ascent: 1 | 0 | string
	}

	async function updateData(data: Data & { id: string }, moduleId: string) {
		await c.env.DB
			.prepare('UPDATE modules SET id = ?, category = ?, title = ?, ascent = ? WHERE id = ?')
			.bind(data.id, data.category, data.title, data.ascent, moduleId)
			.run()
	}


	const body = (await c.req.parseBody()) as unknown as Data & { id: string }
	body.id = `${body.category}:${body.type}`
	body.ascent = body.ascent === "on" ? 1 : 0

	const moduleId = c.req.param('id_module')

	const isIdExists = await c.env.DB.prepare("SELECT id FROM modules WHERE id = ? AND id IS NOT ?").bind(body.id, moduleId).first()
	if (isIdExists) return c.html(`Category ${body.category} telah memiliki type ${body.type}`, 400)
	
	await updateData(body, moduleId)

	return c.html(
		<ModulesRow
			mod={ body as unknown as AcesModule }
		/>
	)
}

export async function POST_ModuleEditor(c: Context<{ Bindings: Env }>) {
	type Data = {
		category: string,
		type: string,
		title: string,
		ascent: 1 | 0 | string
	}

	const body = (await c.req.parseBody()) as unknown as Data & { id: string }
	body.id = `${body.category}:${body.type}`
	body.ascent = body.ascent === "on" ? 1 : 0

	const isIdExists = await c.env.DB.prepare("SELECT id FROM modules WHERE id = ?").bind(body.id).first()
	if (isIdExists) return c.html(`Category ${body.category} telah memiliki type ${body.type}`, 400)
	
	await c.env.DB
		.prepare('INSERT INTO modules (id, category, title, ascent) VALUES (?,?,?,?)')
		.bind(body.id, body.category, body.title, body.ascent)
		.run()

	c.res.headers.append('HX-Trigger', `{"module-inserted": {}}`);
	return c.html(
		<ModulesRow
			mod={ body as unknown as AcesModule }
		/>
	)
}