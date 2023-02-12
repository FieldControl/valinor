import type { RawSession, SafeSession } from '@types';
import { generateCompoundSnowflake } from '@utils/idUtils.js';
import { removeUndefinedKeys } from '@utils/object.js';
import { generateToken } from '@utils/token.js';
import { TableWorkerIdentifiers } from 'constants.js';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function createSession(data: { user_id: string }): Promise<SafeSession> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const token = generateToken(data.user_id);

	const session: Omit<RawSession, 'created_at' | 'updated_at'> = {
		id: generateCompoundSnowflake(TableWorkerIdentifiers.Sessions),
		session_token: token.hash,
		user_id: data.user_id,
	};

	const [rawSession] = await sql<[RawSession]>`
		insert into sessions ${sql(session as Record<string, unknown>, ...Object.keys(session))}
		returning *
	`;

	return removeUndefinedKeys({
		...rawSession,
		token: token.token,
		session_token: undefined,
	});
}
