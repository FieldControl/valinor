import { createHmac } from 'node:crypto';
import { TOKEN_EXPIRATION_MS } from 'constants.js';
import { convertFromBase64, convertToBase64, createDigestedHash } from './hash.js';
import { resolveEnv } from './resolveEnv.js';

export function generateToken(user_id: string) {
	const parts = [
		{
			alg: 'sha512',
			typ: 'hmac',
		},
		{
			user_id,
			created_at: new Date().toISOString(),
			expire_at: new Date(Date.now() + TOKEN_EXPIRATION_MS).toISOString(),
		},
	].map((part) => convertToBase64(JSON.stringify(part)));

	const signature = createHmac('sha512', resolveEnv('HMAC_SECRET')).update(parts.join('.')).digest('base64');

	return {
		token: parts.concat(signature).join('.'),
		hash: createDigestedHash(signature, 'sha512'),
	};
}

export function validateToken(token: string) {
	const [header, payload, signature] = token!.split('.');

	const [headerData, payloadData] = [header, payload].map((part) => JSON.parse(convertFromBase64(part!)));

	if (headerData.alg !== 'sha512' || headerData.typ !== 'hmac') {
		return { isValid: false };
	}

	if (new Date(payloadData.created_at) > new Date()) {
		return { isValid: false };
	}

	if (new Date(payloadData.expire_at) < new Date()) {
		return { isValid: false };
	}

	const verifyHmac = createHmac(headerData.alg, resolveEnv('HMAC_SECRET'))
		.update(`${header}.${payload}`)
		.digest('base64');

	console.log(verifyHmac, signature);

	return {
		user_id: payloadData.user_id,
		created_at: new Date(payloadData.created_at),
		expire_at: new Date(payloadData.expire_at),
		isValid: verifyHmac === signature,
	};
}
