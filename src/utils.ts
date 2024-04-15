import { Context } from 'hono';
import { encrypt } from './crypto';
import { randomNamesAndUsernames } from './names';
import { getCookie } from 'hono/cookie';
import { unsealData } from 'iron-session';

export function randomToken() {
	return '012345678901234567890123456789'
		.split('')
		.sort(() => Math.random() - 0.5)
		.join('')
		.substring(0, 6);
}

export function uniqueToken(tokens: string[]) {
	let token = tokens[0];
	while (tokens.includes(token)) {
		token = randomToken();
	}
	return token;
}

export async function randomNamesWithPassword(c: Context, n = 20) {
	const array = [];
	const names = randomNamesAndUsernames(n);
	for (let i = 0; i < n; i++) {
		const hash = await encrypt(randomToken(), c);
		array.push({ name: names[i].name, username: names[i].username, hash });
	}
	return array;
}

export async function getSessionUser(c: Context) {
	const cookie = getCookie(c, c.env.COOKIE_NAME);
	if (!cookie) return null;
	const user = await unsealData(cookie, { password: c.env.COOKIE_PASSWORD });
	return user as unknown as Admin;
}

export async function getBatch(db: D1Database, batch_id: number | string) {
	const stm = 'SELECT * FROM v_batches WHERE id=?';
	const found = await db.prepare(stm).bind(batch_id).first();
	return found ? (found as VBatch) : null;
}

export function getBatchRuntimeInfo(modules: VBatchModule[], batch_id: number, batch_type = 'ASCENT', split = 1) {
	const isAC = batch_type == 'ASCENT';
	const info = {
		batch_id,
		modules: modules.length,
		// tokens: modules.map((m) => m.category + ':' + m.module_id),
		tokens: modules.map((m) => m.module_id),
		slot_mode: isAC ? ascentBatchMode(modules) : 'CUSTOM ' + modules.length,
		types: '' + modules.map((m) => m.category).join('-'),
		permutation: 4,
		grouping: modules.find((m) => m.category == 'DISC') ? 'BYDISC' : 'BYSLOT',
		runtime: modules.find((m) => m.category == 'FACE') || modules.find((m) => m.category == 'DISC') ? 'ASSISSTED' : 'AUTO',
		mod_self: isAC ? modules.find((m) => m.category == 'SELF') || null : null,
		mod_case: isAC ? modules.find((m) => m.category == 'CASE') || null : null,
		mod_face: isAC ? modules.find((m) => m.category == 'FACE') || null : null,
		mod_disc: isAC ? modules.find((m) => m.category == 'DISC') || null : null,
		mod_1: isAC ? null : modules[0] || null,
		mod_2: isAC ? null : modules[1] || null,
		mod_3: isAC ? null : modules[2] || null,
		mod_4: isAC ? null : modules[3] || null,
	};
	if (modules.length == 3) {
		info.permutation = 3;
	} else if (modules.length == 2) {
		if (info.slot_mode == 'SELF-CASE') {
			info.permutation = split > 1 ? 2 : 1;
		} else {
			info.permutation = split > 1 ? 4 : 2;
		}
	} else if (modules.length == 1) {
		info.permutation = split;
	}
	return info as BatchRuntimeInfo;
}

function ascentBatchMode(modules: VBatchModule[]) {
	let mode = '';
	if (modules.length == 4) {
		mode = 'ALL-TYPES';
	} else if (modules.length == 1) {
		mode = modules[0].category + '-ONLY';
	} else if (modules.length == 3) {
		const cats = modules.map((bm) => bm.category);
		if (!cats.includes('SELF')) mode = 'NO-SELF';
		else if (!cats.includes('CASE')) mode = 'NO-CASE';
		else if (!cats.includes('FACE')) mode = 'NO-FACE';
		else if (!cats.includes('DISC')) mode = 'NO-DISC';
	} else if (modules.length == 2) {
		const cats = modules.map((bm) => bm.category);
		if (cats.includes('SELF') && cats.includes('CASE')) mode = 'SELF-CASE';
		else if (cats.includes('SELF') && cats.includes('DISC')) mode = 'SELF-DISC';
		else if (cats.includes('SELF') && cats.includes('FACE')) mode = 'SELF-FACE';
		else if (cats.includes('CASE') && cats.includes('DISC')) mode = 'CASE-DISC';
		else if (cats.includes('CASE') && cats.includes('FACE')) mode = 'CASE-FACE';
		else if (cats.includes('DISC') && cats.includes('FACE')) mode = 'DISC-FACE';
	}
	return mode;
}

export async function regroupAscentBatch(db: D1Database, persons: Person[], info: BatchRuntimeInfo) {
	// delete groupings
	const stm0 = `DELETE FROM groupings WHERE batch_id=?`;
	const stm1 = `DELETE FROM groups WHERE batch_id=?`;
	await db.batch([
		//
		db.prepare(stm0).bind(info.batch_id),
		db.prepare(stm1).bind(info.batch_id),
	]);

	if (persons.length == 0) return [];

	// Load slots
	const stm3 = `SELECT id,slot1,slot2,slot3,slot4 FROM slots WHERE mode=?`;
	const rs3 = await db.prepare(stm3).bind(info.slot_mode).all();
	const _slots = rs3.results as { id: number; slot1: string; slot2: string; slot3: string; slot4: string }[];
	const module_ids = info.tokens;
	// Rewrite slots
	const slots: CustomSlot[] = [];
	for (let i = 0; i < _slots.length; i++) {
		slots.push({
			slot1: module_ids.find((x) => x.startsWith(_slots[i].slot1)) || null,
			slot2: module_ids.find((x) => x.startsWith(_slots[i].slot2)) || null,
			slot3: module_ids.find((x) => x.startsWith(_slots[i].slot3)) || null,
			slot4: module_ids.find((x) => x.startsWith(_slots[i].slot4)) || null,
		});
	}

	// Pattern
	const pattern = info.grouping == 'BYDISC' ? groupPattern(persons.length) : slotGroupPattern(persons.length, info.permutation);

	// 3. Define groups
	const groups: any[] = pattern.map((g, i) => {
		const index = i % info.permutation;
		return {
			id: `${info.batch_id}-${String(i + 1).padStart(2, '0')}`,
			members: g,
			batch_id: info.batch_id,
			name: 'Grup ' + (i + 1),
			slot1: slots[index].slot1,
			slot2: slots[index].slot2,
			slot3: slots[index].slot3,
			slot4: slots[index].slot4,
		};
	});

	// 4. Define groupings
	const groupings: Grouping[] = [];
	let personIndex = 0;
	for (let i = 0; i < groups.length; i++) {
		const g = groups[i].members as number;
		for (let j = 0; j < g; j++) {
			groupings.push({
				batch_id: info.batch_id,
				group_id: groups[i].id,
				person_id: persons[personIndex].id,
				face_ass_id: null,
				case_ass_id: null,
			});
			personIndex++;
		}
	}

	const group_values = groups
		.map((g) => `('${g.id}', ${g.batch_id}, '${g.name}', '${g.slot1}', '${g.slot2}', '${g.slot3}', '${g.slot4}')`)
		.join(', ');
	const grouping_values = groupings.map((g) => `(${g.batch_id}, '${g.group_id}', '${g.person_id}')`).join(', ');
	const stm00 = 'INSERT INTO groups (id, batch_id, name, slot1, slot2, slot3, slot4) VALUES ' + group_values;
	const stm01 = 'INSERT INTO groupings (batch_id, group_id, person_id) VALUES ' + grouping_values;
	const stm02 = `SELECT * FROM v_groups WHERE batch_id=?`;
	const stm03 = `UPDATE batches SET regrouping=0 WHERE id=?`;
	const rs_grouping = await db.batch([
		//
		db.prepare(stm00),
		db.prepare(stm01),
		db.prepare(stm02).bind(info.batch_id),
		db.prepare(stm03).bind(info.batch_id),
	]);

	// return { groups, groupings };
	return rs_grouping[2].results;
}

export async function regroupCustomBatch(db: D1Database, persons: Person[], info: BatchRuntimeInfo) {
	// delete groupings
	const stm0 = `DELETE FROM groupings WHERE batch_id=?`;
	const stm1 = `DELETE FROM groups WHERE batch_id=?`;
	await db.batch([
		//
		db.prepare(stm0).bind(info.batch_id),
		db.prepare(stm1).bind(info.batch_id),
	]);

	// Create groups
	const module_ids = info.tokens; //.map((s) => s.split(':')[1]);
	const slots = customSlots(module_ids);
	console.log('module_ids', module_ids);
	console.log('SLOTS', slots);
	const pattern = info.grouping == 'BYDISC' ? groupPattern(persons.length) : slotGroupPattern(persons.length, info.permutation);
	const groups: any[] = pattern.map((g, i) => {
		const index = i % info.permutation;
		return {
			id: `${info.batch_id}-${String(i + 1).padStart(2, '0')}`,
			members: g,
			batch_id: info.batch_id,
			name: 'Group ' + (i + 1),
			slot1: slots[index].slot1,
			slot2: slots[index].slot2,
			slot3: slots[index].slot3,
			slot4: slots[index].slot4,
		};
	});

	// Create grouping
	const groupings: Grouping[] = [];
	let personIndex = 0;
	for (let i = 0; i < groups.length; i++) {
		const g = groups[i].members as number;
		for (let j = 0; j < g; j++) {
			groupings.push({
				batch_id: info.batch_id,
				group_id: groups[i].id,
				person_id: persons[personIndex].id,
				face_ass_id: null,
				case_ass_id: null,
			});
			personIndex++;
		}
	}

	const group_values = groups
		.map((g) => `('${g.id}', ${g.batch_id}, '${g.name}', '${g.slot1}', '${g.slot2}', '${g.slot3}', '${g.slot4}')`)
		.join(', ');
	const grouping_values = groupings.map((g) => `(${g.batch_id}, '${g.group_id}', '${g.person_id}')`).join(', ');
	const stm00 = 'INSERT INTO groups (id, batch_id, name, slot1, slot2, slot3, slot4) VALUES ' + group_values;
	const stm01 = 'INSERT INTO groupings (batch_id, group_id, person_id) VALUES ' + grouping_values;
	const stm02 = `SELECT * FROM v_groups WHERE batch_id=?`;
	const stm03 = `UPDATE batches SET regrouping=0 WHERE id=?`;
	const rs_grouping = await db.batch([
		//
		db.prepare(stm00),
		db.prepare(stm01),
		db.prepare(stm02).bind(info.batch_id),
		db.prepare(stm03).bind(info.batch_id),
	]);

	return rs_grouping[2].results;
}

function customSlots(module_ids: string[]): CustomSlot[] {
	const ids = module_ids.length <= 4 ? module_ids : module_ids.slice(0, 4);
	// 4 modules
	if (ids.length == 4)
		return [
			{ slot1: ids[0], slot2: ids[1], slot3: ids[2], slot4: ids[3] },
			{ slot1: ids[1], slot2: ids[2], slot3: ids[3], slot4: ids[0] },
			{ slot1: ids[2], slot2: ids[3], slot3: ids[0], slot4: ids[1] },
			{ slot1: ids[3], slot2: ids[0], slot3: ids[1], slot4: ids[2] },
		];
	if (ids.length == 3)
		return [
			{ slot1: ids[0], slot2: ids[1], slot3: ids[2], slot4: null },
			{ slot1: ids[1], slot2: ids[2], slot3: ids[0], slot4: null },
			{ slot1: ids[2], slot2: ids[0], slot3: ids[1], slot4: null },
		];
	if (ids.length == 2)
		return [
			{ slot1: ids[0], slot2: ids[1], slot3: null, slot4: null },
			{ slot1: ids[1], slot2: ids[0], slot3: null, slot4: null },
			{ slot1: null, slot2: null, slot3: ids[0], slot4: ids[1] },
			{ slot1: null, slot2: null, slot3: ids[1], slot4: ids[0] },
		];
	if (ids.length == 1)
		return [
			{ slot1: ids[0], slot2: null, slot3: null, slot4: null },
			{ slot1: null, slot2: ids[0], slot3: null, slot4: null },
			{ slot1: null, slot2: null, slot3: ids[0], slot4: null },
			{ slot1: null, slot2: null, slot3: null, slot4: ids[0] },
		];
	return [];
}

function groupPattern(pop: number) {
	// let n = parseInt(pop);
	let n = Math.round(pop);
	if (isNaN(n) || n < 1) return [];
	if (n <= 7) return [n];
	if (n == 7) return [4, 3];
	if (n == 8) return [4, 4];
	if (n == 9) return [5, 4];
	if (n == 10) return [5, 5];
	if (n == 11) return [4, 4, 3];
	if (n == 12) return [4, 4, 4];
	if (n == 13) return [5, 4, 4];
	if (n == 14) return [5, 5, 4];

	let jumlahGrup = n % 20 < 5 ? Math.floor(n / 5) : Math.ceil(n / 5);
	let array = Array(jumlahGrup).fill(5);
	let mod1 = n % 5;
	let mod2 = n % 20;
	if (mod1 == 0) return array;
	let index = mod2 < 5 ? jumlahGrup - mod2 : jumlahGrup + mod1 - 5;
	let tweak = mod2 < 5 ? 6 : 4;
	array.fill(tweak, index);
	return array.sort((a, b) => b - a);
}

function slotGroupPattern(pop: number, permutation: number) {
	if (![2, 3, 4].includes(permutation)) return [pop];
	if (permutation == 2) {
		const a = Math.round(pop / permutation);
		return [a, pop - a];
	} else {
		const base = Math.floor(pop / permutation);
		const remainder = pop - base * permutation;
		const rs = Array(permutation).fill(base);
		if (remainder) {
			for (let i = 0; i < remainder; i++) {
				rs[i] += 1;
			}
		}
		return rs;
	}
}

export async function createParticipants(c: Context, participants: TParticipants) {
	const array = [];

	for (let i = 0; i < participants.length; i++) {
		if (!participants[i].name.trim()) continue;
		const username =
			participants[i]?.username?.trim() ?? `${participants[i]?.name.toLocaleLowerCase().split(' ')[0].trim()}-${randomToken()}`;
		const hash = await encrypt(participants[i]?.hash ?? randomToken(), c);
		console.log({ name: participants[i].name, username, hash: participants[i].hash ?? randomToken() });
		array.push({ name: participants[i].name, username, hash });
	}

	if (!isArrayUnique(array.map((x) => x.username))) throw new Error('Username harus unik');

	return array;
}

export function isArrayUnique(array: any[]) {
	return new Set(array).size === array.length;
}
