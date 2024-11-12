import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { KanbanColumn } from '../columns/column.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(KanbanColumn)
    private columnRepository: Repository<KanbanColumn>,
  ) { }

  async findAll(): Promise<Card[]> {
    return this.cardRepository.find({ relations: ['column'] });
  }

  async findOne(id: number): Promise<Card> {
    return this.cardRepository.findOne({ where: { id }, relations: ['column'] });
  }

  async create(
    title: string,
    description: string,
    columnId: number,
    order?: number,
  ): Promise<Card> {
    const column = await this.columnRepository.findOne({ where: { id: columnId } });

    if (!column) {
      throw new Error('Column not found');
    }

    if (order === undefined) {
      const lastCard = await this.cardRepository.findOne({
        where: { column: { id: columnId } },
        order: { order: 'DESC' },
      });
      order = lastCard ? lastCard.order + 1 : 1;
    }

    const card = this.cardRepository.create({ title, description, column, order });

    return this.cardRepository.save(card);
  }

  async update(
    id: number,
    title: string,
    description: string,
    columnId?: number,
    order?: number,
  ): Promise<Card> {
    let column: KanbanColumn = null;

    if (columnId) {
      column = await this.columnRepository.findOne({ where: { id: columnId } });
      if (!column) {
        throw new Error('Column not found');
      }
    }

    await this.cardRepository.update(id, { title, description, column, order });
    return this.cardRepository.findOne({ where: { id }, relations: ['column'] });
  }

  async remove(id: number): Promise<void> {
    await this.cardRepository.delete(id);
  }
}
