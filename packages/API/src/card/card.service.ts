import { Injectable } from '@nestjs/common';
import { CardRepository } from './card.repository';

@Injectable()
export class CardService {
  constructor(private readonly cardRepository: CardRepository) {}

  async getCard() {
    return this.cardRepository.getCards();
  }

  async createCard(nome: string) {
    return this.cardRepository.createCard(nome);
  }
}
