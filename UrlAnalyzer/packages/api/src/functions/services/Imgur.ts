import { Buffer } from 'node:buffer';
import { HttpError } from '@structures/httpError.js';
import { HttpStatusCode } from '@types';
import { createDigestedHash } from '@utils/hash.js';
import { resolveEnv } from '@utils/resolveEnv.js';
import { ImgurRateLimitTime } from 'constants.js';
import got from 'got';
import ImgurClient from 'imgur';
import type { Redis } from 'ioredis';
import { kRedis } from 'tokens.js';
import { container } from 'tsyringe';

export default class Imgur {
	public imgurClient: ImgurClient.ImgurClient;

	public redis = container.resolve<Redis>(kRedis);

	public cache = new Map<
		string,
		{
			id: string | null;
			url: string;
		}
	>();

	public constructor() {
		this.imgurClient = new ImgurClient.ImgurClient({
			clientId: resolveEnv('IMGUR_CLIENT_ID'),
			clientSecret: resolveEnv('IMGUR_CLIENT_SECRET'),
		});

		if (!this.redis.exists('rateLimits:imgur_upload')) {
			this.redis.set('rateLimits:imgur_upload', 0, 'EX', ImgurRateLimitTime, 'NX');
		}
	}

	public async rateLimit() {
		const rateLimit = await this.redis.incr('rateLimits:imgur_upload');

		if (rateLimit >= 2_499) {
			throw new HttpError(HttpStatusCode.TooManyRequests, 'RateLimit', 'We have reached the Imgur API rate limit');
		}

		return rateLimit;
	}

	public async uploadImage({
		data,
		type,
		url,
	}: {
		data: Buffer | string;
		type: 'private' | 'public';
		url: string;
	}): Promise<{ id: string | null; url: string }> {
		const hash = createDigestedHash(url);

		if (await this.redis.exists(`imgur_cache:${hash}`)) {
			return JSON.parse((await this.redis.get(`imgur_cache:${hash}`))!) as { id: string | null; url: string };
		}

		await this.rateLimit();

		const description = `Screenshot for ${url} (${type})`;

		const image = await this.imgurClient.upload({
			description,
			image: data instanceof Buffer ? data : got.stream(data),
			name: `${type}-${createDigestedHash(url)}`,
			title: description,
			type: 'stream',
		});

		if (!image?.success) {
			throw new HttpError(image.status, 'ImgurError', (image.data as unknown as string) ?? 'Unknown error');
		}

		void this.redis.set(
			`imgur_cache:${hash}`,
			JSON.stringify({
				url: image.data.link,
				id: image.data.deletehash ?? null,
			}),
			'EX',
			ImgurRateLimitTime,
			'NX',
		);

		return {
			url: image.data.link,
			id: image.data.deletehash ?? null,
		};
	}

	public async deleteImage(id: string) {
		const image = await this.imgurClient.deleteImage(id);

		if (!image?.success) {
			throw new HttpError(image.status, 'ImgurError', 'Unknown error');
		}

		return true;
	}
}
