// NestJS
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// TypeORM
import { Repository } from 'typeorm';
// Entities
import { Card } from './entities/card.entity';
// DTOs
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
// Services
import { ColumnsService } from '../columns/columns.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private columnsService: ColumnsService
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    await this.columnsService.findOne(createCardDto.columnId);

    const card = this.cardsRepository.create(createCardDto);
    return await this.cardsRepository.save(card);
  }

  async findAll(): Promise<Card[]> {
    return await this.cardsRepository.find({
      relations: ['column'],
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findByColumn(columnId: number): Promise<Card[]> {
    return await this.cardsRepository.find({
      where: { columnId },
      relations: ['column'],
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id },
      relations: ['column'],
    });

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.findOne(id);

    if (updateCardDto.columnId && updateCardDto.columnId !== card.columnId) {
      await this.columnsService.findOne(updateCardDto.columnId);
    }

    Object.assign(card, updateCardDto);
    return await this.cardsRepository.save(card);
  }

  async remove(id: number): Promise<void> {
    const card = await this.findOne(id);
    await this.cardsRepository.remove(card);
  }

  async moveCard(
    cardId: number,
    newColumnId: number,
    newPosition: number
  ): Promise<Card> {
    const card = await this.findOne(cardId);

    await this.columnsService.findOne(newColumnId);

    card.columnId = newColumnId;
    card.position = newPosition;

    return await this.cardsRepository.save(card);
  }

  async updatePositions(
    cards: { id: number; position: number; columnId?: number }[]
  ): Promise<Card[]> {
    const updatePromises = cards.map(({ id, position, columnId }) => {
      const updateData: any = { position };
      if (columnId !== undefined) {
        updateData.columnId = columnId;
      }
      return this.cardsRepository.update(id, updateData);
    });

    await Promise.all(updatePromises);
    return await this.findAll();
  }
}
