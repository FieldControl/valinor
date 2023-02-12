import { getRecent, getScan } from '@database/scans/getScan.js';
import { HttpError } from '@structures/httpError.js';
import UrlAnalysis from '@structures/urlAnalysis.js';
import type { GETRecentScanEndpointReturn, GETScanEndpointReturn } from '@types';
import { HttpStatusCode } from '@types';
import { errorResponse, sendResponse } from '@utils/respond.js';
import { OP_DELIMITER } from 'constants.js';
import type { Request, Response } from 'express';
import type { Redis } from 'ioredis';
import { kCache, kRedis } from 'tokens.js';
import { container } from 'tsyringe';
import type { InternalCache } from 'types/types.js';

export async function getScanHandler(req: Request, res: Response): Promise<void> {
	const cache = container.resolve<InternalCache>(kCache);
	const redis = container.resolve<Redis>(kRedis);

	try {
		const { scan_id } = req.params;

		if (!scan_id) {
			throw new HttpError(HttpStatusCode.BadRequest, 'MissingParameters', 'Missing ID');
		}

		const result = cache.get(scan_id);

		if (result) {
			await redis.del(`url_analysis${OP_DELIMITER}${scan_id}`);

			if (result.ok) {
				sendResponse<GETScanEndpointReturn>(result.data!, res);
			} else {
				throw new HttpError(HttpStatusCode.BadRequest, 'NavigationFailed', result.error);
			}

			return;
		}

		const dbResult = await getScan(scan_id);

		if (!dbResult && (await redis.exists(`url_analysis${OP_DELIMITER}${scan_id}`))) {
			throw new HttpError(HttpStatusCode.NotFound, 'NavigationInProgress', 'Navigation in progress');
		}

		if (!dbResult) {
			throw new HttpError(HttpStatusCode.NotFound, 'NotFound', 'Analysis not found');
		}

		sendResponse<GETScanEndpointReturn>(await UrlAnalysis.createFromDbResult(dbResult), res);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}

export async function getRecentScanHandler(req: Request, res: Response): Promise<void> {
	try {
		const { limit, offset } = req.query;

		if (!limit || !offset) {
			throw new HttpError(HttpStatusCode.BadRequest, 'MissingParameters', 'Missing limit or offset');
		}

		const result = await getRecent(Number(limit), Number(offset));

		if (!result) {
			throw new HttpError(HttpStatusCode.NotFound, 'NotFound', 'Analysis not found');
		}

		sendResponse<GETRecentScanEndpointReturn>(result, res);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}
