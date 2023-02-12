import { HttpError } from '@structures/httpError.js';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { OP_DELIMITER, RATE_LIMITS } from '../../constants.js';
import { kRedis } from '../../tokens.js';
import { HttpStatusCode } from '../../types/index.js';
import type { RateLimit, RedisRateLimitTuple } from './checkRateLimit.js';

export async function userRateLimitHandler(
	ip: string,
	endpoint: string,
	tokenHmac: string | null | undefined,
): Promise<RateLimit> {
	if (!tokenHmac)
		return {
			error: null,
			headers: {},
		};

	const redis = container.resolve<Redis>(kRedis);

	const key = ['ratelimit', 'user', 'ip', ip, 'token', tokenHmac].join(OP_DELIMITER);
	const endpointKey = ['ratelimit', 'user', 'ip', ip, 'endpoint', endpoint, 'token', tokenHmac].join(OP_DELIMITER);

	const [, [, globalCount], [, globalReset], , [, endpointCount], [, endpointReset]] = (await redis
		.multi()
		.set(key, 0, 'EX', 60, 'NX')
		.incr(key)
		.ttl(key)
		.set(endpointKey, 0, 'EX', 60, 'NX')
		.incr(key)
		.ttl(endpointKey)
		.exec()) as RedisRateLimitTuple;

	let error: HttpError | null = null;

	if (globalCount && globalCount >= RATE_LIMITS.IP.GLOBAL) {
		error = new HttpError(
			HttpStatusCode.TooManyRequests,
			'RateLimit',
			'Você atingiu o limite de requisições por minuto',
		);
	}

	if (endpointCount && endpointCount >= RATE_LIMITS.IP.PER_ENDPOINT) {
		error = new HttpError(
			HttpStatusCode.TooManyRequests,
			'RateLimit',
			'Você atingiu o limite de requisições por minuto para este endpoint',
		);
	}

	return {
		error,
		headers: {
			'X-RateLimit-User-Endpoint-Remaining': Math.max(RATE_LIMITS.IP.PER_ENDPOINT - endpointCount, 0),
			'X-RateLimit-User-Endpoint-Reset': endpointReset,
			'X-RateLimit-User-Global-Remaining': Math.max(RATE_LIMITS.IP.GLOBAL - globalCount, 0),
			'X-RateLimit-User-Global-Reset': globalReset,
		},
	};
}
