import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './cards.entity';
import { Repository } from 'typeorm';
import { ColumnsService } from '../columns/columns.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly columnsService: ColumnsService,
  ) {}

  async create(content: string, columnId: string): Promise<Card> {
    const column = await this.columnsService.findOne(columnId);

    const lastCard = await this.cardRepository.findOne({
      where: { column: { id: columnId } },
      order: { order: 'DESC' },
    });

    const nextOrder = lastCard ? lastCard.order + 1 : 0;

    const card = this.cardRepository.create({
      content,
      column,
      order: nextOrder,
    });

    return this.cardRepository.save(card);
  }

  async update(id: string, content: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['column'],
    });
    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }
    card.content = content;
    return this.cardRepository.save(card);
  }

  async move(id: string, newColumnId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['column'],
    });
    if (!card) {
      throw new NotFoundException(`Card with id ${id} not found`);
    }
    const newColumn = await this.columnsService.findOne(newColumnId);
    card.column = newColumn;
    return this.cardRepository.save(card);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.cardRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByColumn(columnId: string): Promise<Card[]> {
    return this.cardRepository.find({
      where: { column: { id: columnId } },
      relations: ['column'],
      order: { order: 'ASC' },
    });
  }
}
