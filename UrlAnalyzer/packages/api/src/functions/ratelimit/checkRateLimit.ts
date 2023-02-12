import type { HttpError } from '@structures/httpError.js';
import { ipRateLimitHandler } from './handleIP.js';
import { userRateLimitHandler } from './handleUser.js';

export interface RateLimit {
	error: HttpError | null;
	headers: {
		[key: string]: number;
	};
}

type RedisMultiResultTuple<T = number | string> = [Error | null, T];
export type RedisRateLimitTuple = [
	RedisMultiResultTuple<string>,
	RedisMultiResultTuple<number>,
	RedisMultiResultTuple<number>,
	RedisMultiResultTuple<string>,
	RedisMultiResultTuple<number>,
	RedisMultiResultTuple<number>,
];

export async function checkRateLimit(
	ip: string,
	endpoint: string,
	tokenHmac: string | null | undefined,
): Promise<RateLimit> {
	const [ipResult, userResult] = (await Promise.all([
		ipRateLimitHandler(ip, endpoint),
		userRateLimitHandler(ip, endpoint, tokenHmac),
	])) as [RateLimit, RateLimit];

	return {
		error: ipResult.error ?? userResult.error ?? null,
		headers: {
			...ipResult.headers,
			...userResult.headers,
		},
	};
}
