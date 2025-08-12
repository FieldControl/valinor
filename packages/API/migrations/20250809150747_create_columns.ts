import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('columns', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('order').notNullable().unique();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('columns');
}


