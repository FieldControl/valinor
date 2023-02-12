import { returnObjectOrNull } from '@utils/object.js';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { kSQL } from '../../tokens.js';
import type { RawUser, SafeUser } from '../../types/index.js';
import { conditionalSafeUser } from './utils.js';

export async function getUserByEmail(email: string, safe?: false): Promise<RawUser | null>;
export async function getUserByEmail(email: string, safe: true): Promise<SafeUser | null>;
export async function getUserByEmail(email: string, safe = true): Promise<SafeUser | null> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [user] = await sql<[RawUser]>`
		select * from users where email = ${email.toLowerCase()}
	`;

	return returnObjectOrNull(conditionalSafeUser(user, safe));
}

export async function getUserById(id: string): Promise<SafeUser | null> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [user] = await sql<[RawUser]>`
		select * from users where id = ${id}
	`;

	return returnObjectOrNull(conditionalSafeUser(user));
}

export async function getAllUsers(
	limit: number | null,
	offset: number,
	order_by = 'created_at',
	order_type: 'asc' | 'desc' = 'asc',
) {
	const sql = container.resolve<Sql<any>>(kSQL);

	const users = await (Number(limit) === 0
		? sql.unsafe<[RawUser]>(`select * from users order by ${order_by} ${order_type}`)
		: sql.unsafe<[RawUser]>(`select * from users order by ${order_by} ${order_type} limit $1 offset $2`, [
				limit,
				offset,
		  ]));

	return {
		users: users.map((user) => conditionalSafeUser(user)),
		count: (await sql<[{ count: number }]>`select count(*) from users`)[0].count,
	};
}
