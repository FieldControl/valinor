import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card/card.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  // Método para criar um novo card
  async create(cardData: Partial<Card>): Promise<Card> {
    const card = this.cardRepository.create(cardData);
    return this.cardRepository.save(card);
  }

  // Método para listar todos os cards
  async findAll(): Promise<Card[]> {
    return this.cardRepository.find({ relations: ['column'] });
  }

  // Método para buscar um card pelo ID
  async findOne(id: number): Promise<Card> {
    return this.cardRepository.findOne({
      where: { id },
      relations: ['column'],
    });
  }

  // Método para atualizar um card
  async update(id: number, cardData: Partial<Card>): Promise<Card> {
    await this.cardRepository.update(id, cardData);
    return this.findOne(id);
  }

  // Método para remover um card
  async remove(id: number): Promise<void> {
    await this.cardRepository.delete(id);
  }
}
