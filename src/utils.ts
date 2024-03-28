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

export function getAscentBatchInfo(modules: VBatchModule[]) {
	return {
		tokens: modules.map((m) => m.category + ':' + m.module_id),
		mod_self: modules.find((m) => m.category == 'SELF') || null,
		mod_case: modules.find((m) => m.category == 'CASE') || null,
		mod_face: modules.find((m) => m.category == 'FACE') || null,
		mod_disc: modules.find((m) => m.category == 'DISC') || null,
		grouping: modules.find((m) => m.category == 'DISC') ? 'DISC' : 'SLOT',
		runtime: modules.find((m) => m.category == 'FACE') || modules.find((m) => m.category == 'DISC') ? 'ASSISSTED' : 'AUTO',
	};
}

export function getBatchRuntimeInfo(modules: VBatchModule[]) {
	return {
		tokens: modules.map((m) => m.category + ':' + m.module_id),
		mod_self: modules.find((m) => m.category == 'SELF') || null,
		mod_case: modules.find((m) => m.category == 'CASE') || null,
		mod_face: modules.find((m) => m.category == 'FACE') || null,
		mod_disc: modules.find((m) => m.category == 'DISC') || null,
		mod_1: modules[0] || null,
		mod_2: modules[1] || null,
		mod_3: modules[2] || null,
		mod_4: modules[3] || null,
		grouping: modules.find((m) => m.category == 'DISC') ? 'DISC' : 'SLOT',
		runtime: modules.find((m) => m.category == 'FACE') || modules.find((m) => m.category == 'DISC') ? 'ASSISSTED' : 'AUTO',
	} as BatchRuntimeInfo;
}
