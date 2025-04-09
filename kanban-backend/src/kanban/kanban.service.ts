import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from './entities/CardEntity';
import { CreateCardInput } from './graphql/dto/create-card.input';
import { UpdateCardInput } from './graphql/dto/update-card.input';

@Injectable()
export class KanbanService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepo: Repository<CardEntity>,
  ) {}

  async createCard(data: CreateCardInput): Promise<CardEntity> {
    const card = this.cardRepo.create(data);
    return this.cardRepo.save(card);
  }

  async updateCard(data: UpdateCardInput): Promise<CardEntity> {
    const card = await this.cardRepo.findOneBy({ id: data.id });
    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }
    if (data.title !== undefined) {
      card.title = data.title;
    }
    if (data.description !== undefined) {
      card.description = data.description;
    }
    if (data.columnId !== undefined) {
      card.columnId = data.columnId;
    }
    return this.cardRepo.save(card);
  }

  async getCard(id: number): Promise<CardEntity> {
    const card = await this.cardRepo.findOneBy({ id });
    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }
    return card;
  }

  async getCardsByColumnId(columnId: number): Promise<CardEntity[]> {
    const cards = await this.cardRepo.find({
      where: { columnId },
      order: { updatedAt: 'ASC' },
    });
    if (!cards || cards.length === 0) {
      throw new NotFoundException('Nenhum card encontrado para esta coluna');
    }
    return cards;
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await this.cardRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Card não encontrado');
    }
    return true;
  }
}
