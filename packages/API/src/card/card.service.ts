import { Injectable } from '@nestjs/common';
import { CardRepository } from './card.repository';
import { ColumnRepository } from 'src/column/column.repository';

@Injectable()
export class CardService {
  constructor(private readonly cardRepository: CardRepository, private readonly columnRepository: ColumnRepository) {}

  async getCard() {
    return this.cardRepository.getCards();
  }

  async createCard(body: { title: string, columnId: number }) {
    const columnExists = await this.columnRepository.getById(body.columnId)
    if(!columnExists) throw new Error('Column does not exists.')
    return this.cardRepository.createCard(body);
  }

  async deleteCard(id: number){
    const cardExists = await this.cardRepository.getCards()
    if(!cardExists) throw new Error('Card does not exists.')
    return this.cardRepository.deleteCard(id)
  }

  async updateCard(id: number, body: { title?: string; columnId?: number }){
    const cardExists = await this.cardRepository.getCards()
    if (!cardExists) throw new Error('Card does not exists.')
    return this.cardRepository.updateCard(id, body)
  }
}
