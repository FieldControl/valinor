import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';

export function createDigestedHash(data: string, alg: string = 'md5'): string {
	return createHash(alg).update(data).digest('hex');
}

export function convertToBase64(data: string): string {
	return Buffer.from(data).toString('base64');
}

export function convertFromBase64(data: string): string {
	return Buffer.from(data, 'base64').toString('utf8');
}
