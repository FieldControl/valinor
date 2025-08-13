import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('cards', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.integer('column_id').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('cards');
}

