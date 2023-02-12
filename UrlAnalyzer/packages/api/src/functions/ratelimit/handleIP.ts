import { HttpError } from '@structures/httpError.js';
import type { Redis } from 'ioredis';
import { container } from 'tsyringe';
import { OP_DELIMITER, RATE_LIMITS } from '../../constants.js';
import { kRedis } from '../../tokens.js';
import { HttpStatusCode } from '../../types/index.js';
import type { RedisRateLimitTuple } from './checkRateLimit.js';

export async function ipRateLimitHandler(ip: string, endpoint: string) {
	const redis = container.resolve<Redis>(kRedis);

	const key = ['ratelimit', 'global', 'ip', ip].join(OP_DELIMITER);
	const endpointKey = ['ratelimit', 'global', 'ip', ip, 'endpoint', endpoint].join(OP_DELIMITER);

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
			'Limite de requisições por minuto atingido para este IP',
		);
	}

	if (endpointCount && endpointCount >= RATE_LIMITS.IP.PER_ENDPOINT) {
		error = new HttpError(
			HttpStatusCode.TooManyRequests,
			'RateLimit',
			'Limite de requisições por minuto atingido para este IP e endpoint',
		);
	}

	return {
		error,
		headers: {
			'X-RateLimit-Endpoint-Remaining': Math.max(RATE_LIMITS.IP.PER_ENDPOINT - endpointCount, 0),
			'X-RateLimit-Endpoint-Reset': endpointReset,
			'X-RateLimit-Global-Remaining': Math.max(RATE_LIMITS.IP.GLOBAL - globalCount, 0),
			'X-RateLimit-Global-Reset': globalReset,
		},
	};
}
