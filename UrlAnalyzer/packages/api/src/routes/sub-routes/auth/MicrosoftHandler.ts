import { URLSearchParams } from 'node:url';
import { createOAuthConnection } from '@database/oauth_connections/createOAuthConnection.js';
import { expireOAuthConnection } from '@database/oauth_connections/deleteOAuthConnection.js';
import { createSession } from '@database/session/createSession.js';
import { createUser } from '@database/users/createUser.js';
import { getUserByEmail } from '@database/users/getUser.js';
import { HttpError } from '@structures/httpError.js';
import { HttpStatusCode } from '@types';
import { resolveEnv } from '@utils/resolveEnv.js';
import { errorResponse } from '@utils/respond.js';
import { validateState } from '@utils/state.js';
import { validateStatusCode } from '@utils/validateStatusCode.js';
import { Providers } from 'constants.js';
import type { Request, Response } from 'express';
import { request } from 'undici';
import logger from '../../../logger.js';

interface TokenResponse {
	access_token: string;
	expires_in: number;
	id_token: string;
	refresh_token: string;
	scope: string;
	token_type: string;
}

interface UserResponse {
	'@odata.context': string;
	businessPhones: string[];
	displayName: string;
	givenName: string;
	id: string;
	jobTitle?: string | null;
	mail?: string | null;
	mobilePhone?: string | null;
	officeLocation?: string | null;
	preferredLanguage?: string | null;
	surname: string;
	userPrincipalName: string;
}

export async function microsoftCallbackHandler(req: Request, res: Response): Promise<void> {
	try {
		const { code, state } = req.query;

		if (!(await validateState(Providers.Microsoft, (state as string)!))) {
			res.redirect('http://localhost:3000/login?error=invalid_state');
			return;
		}

		if (typeof code !== 'string') {
			res.redirect('http://localhost:3000/login?error=invalid_code');
			return;
		}

		if (Reflect.has(req.query, 'error') && Reflect.get(req.query, 'error') === 'access_denied') {
			res.redirect('http://localhost:3000/login?error=access_denied');
			return;
		}

		const tokenReq = await request(
			`https://www.microsoft.com/${resolveEnv('MICROSOFT_OAUTH_CLIENT_TENANT')}/oauth2/v2.0/token`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					client_id: resolveEnv('MICROSOFT_OAUTH_CLIENT_ID'),
					client_secret: resolveEnv('MICROSOFT_OAUTH_CLIENT_SECRET'),
					code,
					grant_type: 'authorization_code',
					redirect_uri: resolveEnv('MICROSOFT_REDIRECT_URI'),
					scope: 'openid profile email',
				}).toString(),
			},
		);

		if (!validateStatusCode(tokenReq.statusCode)) {
			logger.error('Microsoft token request failed', {
				statusCode: tokenReq.statusCode,
				body: await tokenReq.body.text(),
				headers: tokenReq.headers,
			});

			switch (tokenReq.statusCode) {
				case HttpStatusCode.BadRequest:
					res.redirect('http://localhost:3000/login?error=invalid_code');
					return;
				case HttpStatusCode.Unauthorized:
				case HttpStatusCode.Forbidden:
					res.redirect('http://localhost:3000/login?error=invalid_client');
					return;
				default:
					res.redirect('http://localhost:3000/login?error=unknown_error');
					return;
			}
		}

		const token = (await tokenReq.body.json()) as TokenResponse;

		const userReq = await request(`https://graph.microsoft.com/v1.0/me`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access_token}`,
			},
		});

		if (!validateStatusCode(userReq.statusCode)) {
			logger.error('Microsoft user request failed', {
				statusCode: userReq.statusCode,
				body: await userReq.body.json(),
				headers: tokenReq.headers,
			});
			res.redirect('http://localhost:3000/login?error=unknown_error');
			return;
		}

		const userBody = (await userReq.body.json()) as UserResponse;

		const validUserMail = userBody.mail ?? userBody.userPrincipalName;

		const user =
			(await getUserByEmail(validUserMail)) ??
			(await createUser({
				email: validUserMail,
				name: `${userBody.givenName} ${userBody.surname}`,
			}));

		await expireOAuthConnection(user.id, Providers.Microsoft);

		const [session] = await Promise.all([
			createSession({ user_id: user.id }),
			createOAuthConnection({
				access_token: token.access_token!,
				expires_at: new Date(Date.now() + token.expires_in! * 1_000),
				provider: Providers.Microsoft,
				provider_user_id: userBody.id!,
				refresh_token: token.refresh_token!,
				scopes: token.scope!.split(' '),
				user_id: user.id,
			}),
		]);

		res.redirect(
			`http://localhost:3000/login?session=${session.token}&user=${user.id}$provider=${Providers.Microsoft}`,
		);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}
