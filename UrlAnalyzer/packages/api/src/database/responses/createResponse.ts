import type { RawResponse } from '@types';
import { generateSnowflake } from '@utils/idUtils.js';
import { OP_DELIMITER, TableWorkerIdentifiers } from 'constants.js';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function createResponse(data: Omit<RawResponse, 'created_at' | 'updated_at'>): Promise<RawResponse> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const query: Omit<RawResponse, 'created_at' | 'updated_at'> = {
		id: `${data.id}${OP_DELIMITER}${generateSnowflake(TableWorkerIdentifiers.Response)}`,
		parent_id: data.parent_id,
		body: data.body,
		headers: data.headers,
		status: data.status,
		url: data.url,
	};

	const [result] = await sql<[RawResponse]>`
		insert into responses ${sql(query as Record<string, unknown>, ...Object.keys(query))}
		returning *
	`;

	return result;
}
