import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class CardRepository {
  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex
  ) {}

  async getCards() {
    return this.knex('cards').select('*');
  }

  async createCard(body: { title: string, columnId: number }) {
    return this.knex('cards').insert({
      column_id: body.columnId,
      title: body.title
    });
  }

  async deleteCard(id: number){
    const result = await this.knex('cards').delete().where('id', id)
    return result[0]
  }

  async updateCard(id: number, body: { title?: string; columnId?: number }){
    const result = await this.knex('cards').update({
      column_id: body.columnId,
      title: body.title
    }).where('id', id)
    return result[0]
  }
}
