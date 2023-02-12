import { checkAuth } from '@functions/auth/checkAuth.js';
import { checkRateLimit } from '@functions/ratelimit/checkRateLimit.js';
import { HttpError } from '@structures/httpError.js';
import { errorResponse } from '@utils/respond.js';
import type { NextFunction, Request, Response } from 'express';

export function commonFunctionsMiddleware({ noAuthRoutes }: { noAuthRoutes: RegExp[] }) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = noAuthRoutes.some((regex) => regex.test(req.url)) ? null : await checkAuth(req);

			const rateLimit = await checkRateLimit(req.ip, req.url.split('/')?.[0] ?? 'root', null);

			for (const header of Object.keys(rateLimit.headers)) {
				res.setHeader(header, String(rateLimit.headers[header]));
			}

			if (rateLimit.error) {
				throw rateLimit.error;
			}

			console.log(token);

			next();
			return;
		} catch (error) {
			errorResponse(HttpError.fromError(error as Error), res);
		}
	};
}
