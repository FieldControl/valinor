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
import type { APIUser, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import type { Request, Response } from 'express';
import logger from 'logger.js';
import { request } from 'undici';

export async function discordCallbackHandler(req: Request, res: Response): Promise<void> {
	try {
		const { code, state } = req.query;

		if (!(await validateState(Providers.Discord, (state as string)!))) {
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

		const tokenReq = await request('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: resolveEnv('DISCORD_OAUTH_CLIENT_ID'),
				client_secret: resolveEnv('DISCORD_OAUTH_CLIENT_SECRET'),
				redirect_uri: resolveEnv('DISCORD_REDIRECT_URI'),
				code,
				grant_type: 'authorization_code',
			}).toString(),
		});

		if (!validateStatusCode(tokenReq.statusCode)) {
			logger.error('Failed to get token from Discord', {
				statusCode: tokenReq.statusCode,
				body: await tokenReq.body.text(),
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

		const token = (await tokenReq.body.json()) as RESTPostOAuth2AccessTokenResult;

		const userReq = await request('https://discord.com/api/users/@me', {
			method: 'GET',
			headers: {
				Authorization: `${token.token_type} ${token.access_token}`,
			},
		});

		if (!validateStatusCode(userReq.statusCode)) {
			logger.error('Failed to get user from Discord', {
				statusCode: userReq.statusCode,
				body: await userReq.body.text(),
			});

			res.redirect('http://localhost:3000/login?error=unknown_error');
			return;
		}

		const userBody = (await userReq.body.json()) as APIUser;

		const user =
			(await getUserByEmail(userBody.email!)) ??
			(await createUser({
				email: userBody.email!,
				name: userBody.username!,
			}));

		await expireOAuthConnection(user.id, Providers.Discord);

		const [session] = await Promise.all([
			createSession({ user_id: user.id }),
			createOAuthConnection({
				access_token: token.access_token!,
				expires_at: new Date(Date.now() + token.expires_in! * 1_000),
				provider: Providers.Discord,
				provider_user_id: userBody.id!,
				refresh_token: token.refresh_token!,
				scopes: token.scope!.split(' '),
				user_id: user.id,
			}),
		]);

		res.redirect(`http://localhost:3000/login?session=${session.token}&user=${user.id}$provider=${Providers.Discord}`);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}
