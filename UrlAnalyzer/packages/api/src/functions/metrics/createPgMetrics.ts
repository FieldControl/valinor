import type { Sql } from 'postgres';
import { Gauge } from 'prom-client';
import { container } from 'tsyringe';
import { kSQL } from '../../tokens.js';

interface DbSize {
	db_size: number;
}

export function createPgMetrics() {
	const sql = container.resolve<Sql<any>>(kSQL);

	const metricsMetric = new Gauge({
		help: 'Database table counts',
		name: 'url_analyzer_api_db_table_counts',
		labelNames: ['table'],
	});

	const sizesMetric = new Gauge({
		help: 'Database table sizes',
		name: 'url_analyzer_api_db_table_sizes',
		labelNames: ['table'],
	});

	const dbSizeMetric = new Gauge({
		help: 'Database size',
		name: 'url_analyzer_api_db_size',
		labelNames: ['db_name'],
	});

	return async () => {
		const tableNames = await sql<
			[
				{
					table_name: string;
				},
			]
		>`
			SELECT table_name
					FROM information_schema.tables
				   WHERE table_schema='public'
					 AND table_type='BASE TABLE';
		`;

		const [[metrics], [sizes], [dbSize]] = (await sql.begin((lSql) => [
			lSql.unsafe<Record<string, number>[]>(`
				select
					${tableNames.map(({ table_name }) => `(select count(*) from ${table_name}) as ${table_name}`).join(', ')};
			`),
			lSql.unsafe<Record<string, number>[]>(`
				select
					${tableNames
						.map(({ table_name }) => `(select pg_total_relation_size('${table_name}')) as ${table_name}_size`)
						.join(', ')};
			`),
			lSql<[DbSize]>`
				select pg_database_size('url-analyzer') as db_size;
			`,
		])) as [Record<string, number>[], Record<string, number>[], DbSize[]];

		for (const [table, count] of Object.entries(metrics!)) {
			metricsMetric.set({ table }, Number(count));
		}

		for (const [table, size] of Object.entries(sizes!)) {
			sizesMetric.set({ table }, Number(size));
		}

		dbSizeMetric.set({ db_name: 'url-analyzer' }, Number(dbSize!.db_size));
	};
}
