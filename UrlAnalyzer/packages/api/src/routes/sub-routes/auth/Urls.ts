import { HttpError } from '@structures/httpError.js';
import type { GETOAuth2AuthorizeEndpointReturn } from '@types';
import { generateUrl } from '@utils/generateUrl.js';
import { resolveEnv } from '@utils/resolveEnv.js';
import { sendResponse, errorResponse } from '@utils/respond.js';
import { generateState } from '@utils/state.js';
import { Providers } from 'constants.js';
import type { Request, Response } from 'express';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
	resolveEnv('GOOGLE_OAUTH_CLIENT_ID'),
	resolveEnv('GOOGLE_OAUTH_CLIENT_SECRET'),
	resolveEnv('GOOGLE_REDIRECT_URI'),
);

const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];

export async function OAuthGenerateHandler(_: Request, res: Response): Promise<void> {
	try {
		const googleUrl = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: scopes,
			include_granted_scopes: true,
			state: await generateState(Providers.Google),
			prompt: 'consent',
		});

		const discordUrl = generateUrl('https://discord.com/api/oauth2/authorize', {
			client_id: resolveEnv('DISCORD_OAUTH_CLIENT_ID'),
			redirect_uri: resolveEnv('DISCORD_REDIRECT_URI'),
			response_type: 'code',
			scope: 'identify email',
			state: await generateState(Providers.Discord),
			prompt: 'consent',
		});

		const githubUrl = generateUrl('https://github.com/login/oauth/authorize', {
			client_id: resolveEnv('GITHUB_OAUTH_CLIENT_ID'),
			redirect_uri: resolveEnv('GITHUB_REDIRECT_URI'),
			scopes: 'user:email read:user',
			state: await generateState(Providers.GitHub),
			prompt: 'consent',
		});

		const microsoftUrl = generateUrl(
			`https://login.microsoftonline.com/${resolveEnv('MICROSOFT_OAUTH_CLIENT_TENANT')}/oauth2/v2.0/authorize`,
			{
				client_id: resolveEnv('MICROSOFT_OAUTH_CLIENT_ID'),
				redirect_uri: resolveEnv('MICROSOFT_REDIRECT_URI'),
				response_type: 'code',
				scope: 'openid User.Read Mail.Read',
				state: await generateState(Providers.Microsoft),
				prompt: 'consent',
			},
		);

		res.header('Cache-Control', 'no-store');

		sendResponse<GETOAuth2AuthorizeEndpointReturn>(
			{
				google: googleUrl,
				discord: discordUrl,
				github: githubUrl,
				microsoft: microsoftUrl,
			},
			res,
		);
	} catch (error) {
		errorResponse(HttpError.fromError(error as Error), res);
	}
}
