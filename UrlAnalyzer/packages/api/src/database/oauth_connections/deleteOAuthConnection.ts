import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function expireOAuthConnection(user_id: string, provider: string) {
	const sql = container.resolve<Sql<any>>(kSQL);

	await sql`
		delete from oauth_connections
		where user_id = ${user_id}
		and provider = ${provider}
	`;
}
