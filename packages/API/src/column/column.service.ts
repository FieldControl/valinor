import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ColumnRepository } from './column.repository';
import { CardRepository } from 'src/card/card.repository';

@Injectable()
export class ColumnService {
  constructor(private readonly columnRepository: ColumnRepository, private readonly cardRepository: CardRepository) { }

  async getColumns() {
    return this.columnRepository.getColumns();
  }

  async getColumnsWithCards() {
    const columns = await this.columnRepository.getColumns();
    const cards = await this.cardRepository.getCards();

    const columnsWithCards = columns.map(column => ({
      ...column,
      cards: cards.filter(card => card.column_id === column.id)
    }))
    console.log(columnsWithCards, cards)


    return columnsWithCards;
  }

  async createColumn(body: { name: string; order: number }) {
    const columnExists = await this.columnRepository.getByOrder(body.order)
    //console.log(orderExists)
    if (columnExists) throw new Error('Order already in use.') //trtar o erro
    return this.columnRepository.createColumn(body)
  }

  async deleteColumn(id: number) {
    const columnExists = await this.columnRepository.getById(id)
    //console.log(columnExists)
    if (!columnExists) throw new Error('Column does not exists.')
    return this.columnRepository.deleteColumn(id)
  }

  async updateColumn(id: number, data: { name?: string; order?: number }) {
    const columnExists = await this.columnRepository.getById(id)
    if (!columnExists) throw new Error('Column does not exists.') // ok

    if (data.order) {
      const orderInUse = await this.columnRepository.getByOrder(data.order)
      if (orderInUse) throw new Error('Order already in use.')
    }
    return this.columnRepository.updateColumn(id, data)
  }

}
