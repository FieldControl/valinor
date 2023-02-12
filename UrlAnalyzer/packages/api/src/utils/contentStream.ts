import { createGunzip, createInflate } from 'node:zlib';
import { HttpError } from '@structures/httpError.js';
import type { Request } from 'express';
import { HttpStatusCode } from '../types/index.js';

export function contentStream(req: Request) {
	const encoding = (req.headers['content-encoding'] ?? 'identity').toLowerCase();
	const length = req.headers['content-length'];
	let stream;

	switch (encoding) {
		case 'deflate':
			stream = createInflate();
			req.pipe(stream);
			break;
		case 'gzip':
			stream = createGunzip();
			req.pipe(stream);
			break;
		case 'identity':
			stream = req;
			// @ts-expect-error: Tiny hack to make the stream length available to the caller
			stream.length = length;
			break;
		default:
			throw new HttpError(HttpStatusCode.UnsupportedMediaType, 'EncodingNotSupported');
	}

	return stream;
}
