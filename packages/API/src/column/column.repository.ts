import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class ColumnRepository {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex
  ) { }

  async getColumns() {
    return this.knex('columns').select('*');
  }

  async getColumnsWithCards() {
    return this.knex('columns')
      .leftJoin('cards', 'columns.id', 'cards.column_id')
      .select(
        'columns.id as column_id',
        'columns.name as column_name',
        'cards.id as card_id',
        'cards.title as card_title',
        'cards.created_at'
      )
      .orderBy('columns.order', 'asc');
  }


  async getByOrder(order: number) {
    const result = await this.knex('columns').select('*').where('order', order)
    return result[0]
  }

  async getById(id: number) {
    const result = await this.knex('columns').select('*').where('id', id)
    console.log(result)
    return result[0]
  }

  async createColumn(body: { name: string; order: number }) {
    return this.knex('columns').insert(body);
  }

  async deleteColumn(id: number) {
    return this.knex('columns').delete().where('id', id);
  }

  async updateColumn(id: number, data: { name?: string; order?: number }) {
    console.log(data)
    return this.knex('columns').update(data).where('id', id)
  }
}
