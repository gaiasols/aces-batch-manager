import { Context } from 'hono';
import { encrypt } from './crypto';
import { randomNames } from './names';

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
