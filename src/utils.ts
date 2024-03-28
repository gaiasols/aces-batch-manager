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

export async function getBatchModulesData(db: D1Database, batch_id: number | string, priority = false) {
	const stm0 = priority
		? 'SELECT * FROM batch_modules WHERE batch_id=? ORDER BY priority '
		: 'SELECT * FROM batch_modules WHERE batch_id=?';
	const stm1 = 'SELECT * FROM modules';
	const rs = await db.batch([db.prepare(stm0).bind(batch_id), db.prepare(stm1)]);
	const bm = rs[0].results as BatchModule[];
	return {
		selections: bm.map((m: BatchModule) => tokenize(m)),
		modules: rs[1].results as Module[],
	};
}

export function tokenize(m: Module | BatchModule) {
	const x = m as any;
	return x.category + ':' + (x.id ? x.id : x.module_id);
}
