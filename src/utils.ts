import { Context } from 'hono';
import { encrypt } from './crypto';
import { randomNames } from './names';
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
	const names = randomNames(n);
	for (let i = 0; i < n; i++) {
		let username = names[i].toLocaleLowerCase().split(' ')[0];
		if (username.length < 4) username += '123';
		const hash = await encrypt(randomToken(), c);
		array.push({ name: names[i], username, hash });
	}
	return array;
}

export async function createParticipants(c: Context, participants: TParticipants) {
	const array = [];


	for (let i = 0; i < participants.length; i++) {
		if (!participants[i].name.trim()) continue;
		const username = participants[i]?.username?.trim() ?? (`${participants[i]?.name.toLocaleLowerCase().split(' ')[0].trim()}-${randomToken()}`)
		const hash = await encrypt(participants[i]?.hash ?? randomToken(), c)
		console.log({ name: participants[i].name, username, hash: participants[i].hash ?? randomToken() })
		array.push({ name: participants[i].name, username, hash });
	}

	if (!isArrayUnique(array.map(x => x.username))) throw new Error("Username harus unik")

	return array;
}

export function isArrayUnique(array: any[]) {
	return new Set(array).size === array.length;
}

export async function getSessionUser(c: Context) {
	const cookie = getCookie(c, c.env.COOKIE_NAME);
	if (!cookie) return null;
	const user = await unsealData(cookie, { password: c.env.COOKIE_PASSWORD });
	return user as unknown as Admin;
}

export async function getBatchModulesData(db: D1Database, batch_id: number | string, priority = false) {
	const stm0 = 'SELECT * FROM v_batches WHERE id=?';
	const stm1 = priority
		? 'SELECT * FROM batch_modules WHERE batch_id=? ORDER BY priority '
		: 'SELECT * FROM batch_modules WHERE batch_id=?';
	const stm2 = 'SELECT * FROM modules';
	const rs = await db.batch([db.prepare(stm0).bind(batch_id), db.prepare(stm1).bind(batch_id), db.prepare(stm2)]);
	return {
		batch: rs[0].results[0] ? (rs[0].results[0] as VBatch) : null,
		selections: rs[1].results.map((x: any) => x.category + ':' + x.module_id),
		modules: rs[2].results as Module[],
	};
}
