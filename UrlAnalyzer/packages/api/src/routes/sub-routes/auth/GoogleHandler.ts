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
import { google } from 'googleapis';
import logger from 'logger.js';

export async function googleOAuthCallbackHandler(req: Request, res: Response): Promise<void> {
	try {
		const { code, state } = req.query;

		if (!(await validateState(Providers.Google, (state as string)!))) {
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

		const oauth2Client = new google.auth.OAuth2(
			resolveEnv('GOOGLE_OAUTH_CLIENT_ID'),
			resolveEnv('GOOGLE_OAUTH_CLIENT_SECRET'),
			resolveEnv('GOOGLE_REDIRECT_URI'),
		);

		const { tokens, res: getTokenRes } = await oauth2Client.getToken(code);

		const tokenReqStatus = getTokenRes?.status ?? 400;

		if (!validateStatusCode(tokenReqStatus)) {
			logger.error('Google OAuth2 token request failed', { status: tokenReqStatus, body: getTokenRes?.data });

			switch (tokenReqStatus) {
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

		if (!tokens) {
			throw new HttpError(400, 'BadRequest', 'Invalid code');
		}

		oauth2Client.setCredentials(tokens);

		const oauth2 = google.oauth2({
			auth: oauth2Client,
			version: 'v2',
		});

		const { data, status: dataReqStatus } = await oauth2.userinfo.get();

		if (!validateStatusCode(dataReqStatus)) {
			logger.error('Google OAuth2 userinfo request failed', { status: dataReqStatus, body: data });
			res.redirect('http://localhost:3000/login?error=unknown_error');
			return;
		}

		const user =
			(await getUserByEmail(data.email!)) ??
			(await createUser({
				email: data.email!,
				name: data.name!,
			}));

		await expireOAuthConnection(user.id, Providers.Google);

		const [session] = await Promise.all([
			createSession({ user_id: user.id }),
			createOAuthConnection({
				access_token: tokens.access_token!,
				expires_at: new Date(tokens.expiry_date!),
				provider: Providers.Google,
				provider_user_id: data.id!,
				refresh_token: tokens.refresh_token!,
				scopes: tokens.scope!.split(' '),
				user_id: user.id,
			}),
		]);

		res.redirect(`http://localhost:3000/login?session=${session.token}&user=${user.id}$provider=${Providers.Google}`);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}
