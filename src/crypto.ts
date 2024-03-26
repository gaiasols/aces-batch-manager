/*
  https://getstream.io/blog/web-crypto-api-chat/
  https://github.com/GetStream/encrypted-web-chat
*/

import { Context } from 'hono';

export const generateKeyPair = async () => {
	const keyPair = (await crypto.subtle.generateKey(
		{
			name: 'ECDH',
			namedCurve: 'P-256',
		},
		true,
		['deriveKey', 'deriveBits']
	)) as CryptoKeyPair;

	const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

	const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

	return { publicKeyJwk, privateKeyJwk };
};

export const deriveKey = async (c: Context<{ Bindings: Env }>) => {
	const publicJwk = JSON.parse(atob(c.env.DEFAULT_PUBLIC_KEY));
	const privateJwk = JSON.parse(atob(c.env.DEFAULT_PRIVATE_KEY));

	const publicKey = await crypto.subtle.importKey(
		'jwk',
		publicJwk, // publicKeyJwk,
		{
			name: 'ECDH',
			namedCurve: 'P-256',
		},
		true,
		[]
	);

	const privateKey = await crypto.subtle.importKey(
		'jwk',
		privateJwk, // privateKeyJwk,
		{
			name: 'ECDH',
			namedCurve: 'P-256',
		},
		true,
		['deriveKey', 'deriveBits']
	);

	return await crypto.subtle.deriveKey(
		// @ts-ignore
		{ name: 'ECDH', public: publicKey },
		privateKey,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);
};

export const encrypt = async (text: string, c: Context<{ Bindings: Env }>) => {
	const encodedText = new TextEncoder().encode(text);
	const key = await deriveKey(c);

	const encryptedData = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: new TextEncoder().encode('Initialization Vector') },
		key,
		encodedText
	);

	const uintArray = new Uint8Array(encryptedData);

	// @ts-ignore
	const string = String.fromCharCode.apply(null, uintArray);

	const base64Data = btoa(string);

	return base64Data;
};

export const decrypt = async (text: string, c: Context<{ Bindings: Env }>) => {
	const key = await deriveKey(c);

	try {
		const string = atob(text);
		const uintArray = new Uint8Array(
			// @ts-ignore
			[...string].map((char) => char.charCodeAt(0))
		);
		const algorithm = {
			name: 'AES-GCM',
			iv: new TextEncoder().encode('Initialization Vector'),
		};
		const decryptedData = await crypto.subtle.decrypt(algorithm, key, uintArray);

		return new TextDecoder().decode(decryptedData);
	} catch (e) {
		return `error decrypting message: ${e}`;
	}
};
