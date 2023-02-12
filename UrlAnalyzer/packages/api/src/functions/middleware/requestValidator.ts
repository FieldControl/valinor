import { HttpError } from '@structures/httpError.js';
import { contentStream } from '@utils/contentStream.js';
import { errorResponse } from '@utils/respond.js';
import type { Request, Response, NextFunction } from 'express';
import getRawBody from 'raw-body';
import { MAX_BODY_SIZE } from '../../constants.js';
import { RawBodyErrorType, HttpStatusCode } from '../../types/index.js';

interface RawBodyError extends Error {
	readonly status?: number;
	readonly type?: keyof typeof RawBodyErrorType;
}

const charsetRegex = /charset=(?<charset>.+)/;

export function createRequestValidatorMiddleware() {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const contentType = req.headers['content-type']?.toLowerCase();
			// eslint-disable-next-line unicorn/text-encoding-identifier-case
			const charset = charsetRegex.exec(contentType!)?.groups?.charset ?? 'utf-8';

			// eslint-disable-next-line unicorn/text-encoding-identifier-case
			if (charset !== 'utf-8') {
				throw new HttpError(HttpStatusCode.UnsupportedMediaType, 'CharsetUnsupported');
			}

			const content = contentStream(req);

			try {
				const body = await getRawBody(content, {
					encoding: charset,
					length: req.headers['content-length'],
					limit: MAX_BODY_SIZE,
				});

				req.body ??= body.length ? body : {};
			} catch (error) {
				throw new HttpError(
					(error as RawBodyError).status ?? HttpStatusCode.BadRequest,
					RawBodyErrorType[(error as RawBodyError).type!],
				);
			}

			if (req.body !== undefined && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
				const length = req.headers['content-length'] ?? 0;

				if (length < 0) {
					throw new HttpError(HttpStatusCode.BadRequest, 'RequestSizeInvalid');
				}

				if (length > MAX_BODY_SIZE) {
					throw new HttpError(HttpStatusCode.PayloadTooLarge, 'EntityTooLarge');
				}

				if (!contentType) {
					throw new HttpError(HttpStatusCode.UnsupportedMediaType, 'EncodingNotSupported');
				}
			}

			next();
			return;
		} catch (error) {
			errorResponse(HttpError.fromError(error as Error), res);
		}
	};
}
