import type { InternalModifiableUser, RawUser } from '@types';
import { generateSnowflake } from '@utils/idUtils.js';
import { TableWorkerIdentifiers } from 'constants.js';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';
import { UserType } from 'types/enums.js';

export async function createUser(data: Partial<InternalModifiableUser>): Promise<RawUser> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const user: Omit<RawUser, 'created_at' | 'updated_at'> = {
		id: generateSnowflake(TableWorkerIdentifiers.Users),
		active: data.active ?? true,
		email: data.email!,
		name: data.name!,
		password: data.password ?? null,
		known_ips_hashes: data.known_ips_hashes ?? [],
		type: data.type ?? UserType.User,
		last_login_at: null,
		reset_password_token: null,
		terms_accepted_at: null,
		two_factor_config_id: null,
	};

	const [rawUser] = await sql<[RawUser]>`
		insert into users ${sql(user as Record<string, unknown>, ...Object.keys(user))}
		returning *
	`;

	return rawUser;
}
