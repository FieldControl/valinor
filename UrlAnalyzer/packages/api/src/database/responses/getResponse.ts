import type { RawResponse } from '@types';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function getResponse(id: string): Promise<RawResponse> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [result] = await sql<[RawResponse]>`
		select * from responses where id = ${id}
	`;

	return result;
}

export async function getResponsesByParentId(parentId: string): Promise<RawResponse[]> {
	const sql = container.resolve<Sql<any>>(kSQL);

	return sql<RawResponse[]>`
		select * from responses where parent_id = ${parentId}
	`;
}
