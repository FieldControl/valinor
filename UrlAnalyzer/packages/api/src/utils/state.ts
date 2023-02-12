import { createHash, randomBytes } from 'node:crypto';
import type { Providers } from 'constants.js';
import type { Redis } from 'ioredis';
import { kRedis } from 'tokens.js';
import { container } from 'tsyringe';
import { generateSnowflake } from './idUtils.js';

export async function generateState(source: Providers) {
	const redis = container.resolve<Redis>(kRedis);

	const state = createHash('sha256').update(randomBytes(16)).update(generateSnowflake()).digest('hex');

	redis.set(`oauth2:${source}:state:${state}`, 'true', 'EX', 60 * 10);

	return state;
}

export async function validateState(source: Providers, state: string) {
	const redis = container.resolve<Redis>(kRedis);

	const exists = await redis.exists(`oauth2:${source}:state:${state}`);

	if (exists) {
		await redis.del(`oauth2:${source}:state:${state}`);
	}

	return exists;
}
