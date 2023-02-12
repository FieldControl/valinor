import { RouteManager } from '@structures/routeClass.js';
import { discordCallbackHandler } from 'routes/sub-routes/auth/DiscordHandler.js';
import { googleOAuthCallbackHandler } from 'routes/sub-routes/auth/GoogleHandler.js';
import { normalLoginHandler } from 'routes/sub-routes/auth/LoginHandler.js';
import { microsoftCallbackHandler } from 'routes/sub-routes/auth/MicrosoftHandler.js';
import { OAuthGenerateHandler } from 'routes/sub-routes/auth/Urls.js';

export default class AuthRoute extends RouteManager {
	public constructor() {
		super('/oauth2', {
			get: [
				{
					route: '/urls',
					handler: OAuthGenerateHandler,
				},
				{
					route: '/google/callback',
					handler: googleOAuthCallbackHandler,
				},
				{
					route: '/discord/callback',
					handler: discordCallbackHandler,
				},
				{
					route: '/microsoft/callback',
					handler: microsoftCallbackHandler,
				},
				/* 				{
					route: '/github/callback',
					handler: () => {},
				},  */
			],
			post: [
				{
					route: '/login',
					handler: normalLoginHandler,
				},
			],
		});
	}
}
