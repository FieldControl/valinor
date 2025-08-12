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

  async createCard(nome: string) {
    return this.knex('cards').insert({ nome });
  }
}
