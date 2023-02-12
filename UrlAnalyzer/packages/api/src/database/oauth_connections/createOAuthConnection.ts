import type { InternalModifiableOauthConnection, RawOauthConnection } from '@types';
import { generateSnowflake } from '@utils/idUtils.js';
import { TableWorkerIdentifiers } from 'constants.js';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function createOAuthConnection(data: InternalModifiableOauthConnection): Promise<RawOauthConnection> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const oAuth: Omit<RawOauthConnection, 'created_at' | 'updated_at'> = {
		id: generateSnowflake(TableWorkerIdentifiers.OAuthConnections),
		access_token: data.access_token,
		refresh_token: data.refresh_token,
		expires_at: data.expires_at,
		provider: data.provider,
		provider_user_id: data.provider_user_id,
		scopes: data.scopes,
		user_id: data.user_id,
	};

	const [rawOAuth] = await sql<[RawOauthConnection]>`
		insert into oauth_connections ${sql(oAuth as Record<string, unknown>, ...Object.keys(oAuth))}
		returning *
	`;

	return rawOAuth;
}
