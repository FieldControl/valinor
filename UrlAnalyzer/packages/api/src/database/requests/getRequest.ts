import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';
import type { RawRequest } from 'types/database.js';

export async function getRequest(id: string): Promise<RawRequest> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [result] = await sql<[RawRequest]>`
		select * from requests where id = ${id}
	`;

	return result;
}

export async function getRequestsByParentId(parentId: string): Promise<RawRequest[]> {
	const sql = container.resolve<Sql<any>>(kSQL);

	return sql<RawRequest[]>`
		select * from requests where parent_id = ${parentId}
	`;
}
