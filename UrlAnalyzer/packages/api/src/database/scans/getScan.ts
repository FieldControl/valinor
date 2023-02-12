import type { RawUrlAnalysis } from '@types';
import type { Sql } from 'postgres';
import { kSQL } from 'tokens.js';
import { container } from 'tsyringe';

export async function getScan(scan_id: string): Promise<RawUrlAnalysis> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const [result] = await sql<[RawUrlAnalysis]>`
		select * from url_analysis where id = ${scan_id}
	`;

	return result;
}

export async function getRecent(
	limit: number,
	offSet: number,
): Promise<{
	count: number;
	data: RawUrlAnalysis[];
}> {
	const sql = container.resolve<Sql<any>>(kSQL);

	const results = await sql<[RawUrlAnalysis]>`
		select * from url_analysis order by created_at desc limit ${limit} offset ${offSet}
	`;

	return {
		data: results,
		count: (
			await sql<
				[
					{
						count: number;
					},
				]
			>`select count(*) from url_analysis`
		)[0].count,
	};
}
