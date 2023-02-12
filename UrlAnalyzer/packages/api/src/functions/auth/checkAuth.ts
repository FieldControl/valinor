import { HttpError } from '@structures/httpError.js';
import { validateToken } from '@utils/token.js';
import type { Request } from 'express';
import { Counter } from 'prom-client';
import { HttpStatusCode } from '../../types/index.js';

const authMetric = new Counter({
	name: 'url_analyzer_api_auth_requests',
	help: 'Number of auth requests',
	labelNames: ['status', 'user_id'],
});

export async function checkAuth(req: Request) {
	if (!req.header('Authorization')) {
		throw new HttpError(HttpStatusCode.Unauthorized, 'NoAuthHeader');
	}

	const [prefix, tokenString] = req.header('Authorization')!.split(' ');

	if (prefix !== 'Bearer') {
		throw new HttpError(HttpStatusCode.Unauthorized, 'InvalidToken');
	}

	if (!tokenString) {
		throw new HttpError(HttpStatusCode.Unauthorized, 'NoToken');
	}

	const token = validateToken(tokenString);

	if (!token.isValid) {
		authMetric.inc({ status: 'invalid_token', user_id: token.user_id ?? 'Desconhecido' });
		throw new HttpError(HttpStatusCode.Unauthorized, 'UnauthorizedToken');
	}

	authMetric.inc({ status: 'valid_token', user_id: token.user_id ?? 'Desconhecido' });
	return token;
}
