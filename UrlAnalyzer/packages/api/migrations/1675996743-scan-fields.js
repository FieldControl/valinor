/* eslint-disable tsdoc/syntax */
/**
 * @param  {import('postgres').Sql<any>} sql - postgres client
 */
export async function up(sql) {
	await sql.unsafe(`
		alter table url_analysis 
			add column author_id varchar(255) references users(id) on delete set null,
			add column lighthouse_analysis jsonb;
	`);
}
