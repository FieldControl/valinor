import { HttpError } from '@structures/httpError.js';
import UrlAnalysis from '@structures/urlAnalysis.js';
import type { POSTScanResultEndpointReturn } from '@types';
import { HttpStatusCode } from '@types';
import { errorResponse, sendResponse } from '@utils/respond.js';
import { OP_DELIMITER } from 'constants.js';
import type { Request, Response } from 'express';
import type { Redis } from 'ioredis';
import { kRedis } from 'tokens.js';
import { container } from 'tsyringe';

export async function scanHandlerHandler(req: Request, res: Response): Promise<void> {
	const redis = container.resolve<Redis>(kRedis);

	try {
		const { url } = req.body;

		if (!url) {
			throw new HttpError(HttpStatusCode.BadRequest, 'ValidationFailed', 'Missing URL');
		}

		const analysis = new UrlAnalysis(url, null);

		void analysis.navigate();

		await redis.set(`url_analysis${OP_DELIMITER}${analysis.id}`, 'pending', 'EX', 60 * 5);

		sendResponse<POSTScanResultEndpointReturn>(
			{
				id: analysis.id,
				url: analysis.url,
			},
			res,
		);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}
