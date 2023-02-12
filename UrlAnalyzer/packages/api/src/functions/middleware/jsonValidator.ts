import { HttpError } from '@structures/httpError.js';
import { errorResponse } from '@utils/respond.js';
import type { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../../types/index.js';

type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

interface JsonValidatorOptions {
	allowEmptyBody: boolean;
	methods: HttpMethod[];
}

export function createJsonValidatorMiddleware({ methods, allowEmptyBody }: JsonValidatorOptions) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!methods.includes(req.method as HttpMethod)) {
			next();
			return;
		}

		if (req.method === 'PUT' && !Object.keys(req.body).length) {
			next();
			return;
		}

		try {
			const contentType = req.headers['content-type']?.toLowerCase();

			if (!contentType?.includes('application/json')) {
				throw new HttpError(
					HttpStatusCode.UnsupportedMediaType,
					'UnsupportedContentType',
					'O header Content-Type deve ser application/json',
				);
			}

			if (req.body === undefined || (!Object.keys(req.body).length && !allowEmptyBody)) {
				throw new HttpError(HttpStatusCode.BadRequest, 'RequestSizeInvalid', 'O body da requisição não pode ser vazio');
			}

			try {
				req.body = JSON.parse(req.body);
			} catch {
				throw new HttpError(
					HttpStatusCode.BadRequest,
					'EntityParseFailed',
					`O body da requisição não é um JSON válido`,
				);
			}

			next();
			return;
		} catch (error) {
			errorResponse(HttpError.fromError(error as Error), res);
		}
	};
}
