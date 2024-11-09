import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { KanbanColumn } from '../column/column.entity'; 

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(KanbanColumn)  
    private columnRepository: Repository<KanbanColumn>,
  ) {}

  async createCard(title: string, description: string, columnId: number): Promise<Card> {
    if (!title || !description) {
      throw new HttpException('Title and description are required', HttpStatus.BAD_REQUEST);
    }
  
    const column = await this.columnRepository.findOne({ where: { id: columnId } });
    if (!column) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }
  
    const card = this.cardRepository.create({
      title,
      description,
      column,
    });
  
    return await this.cardRepository.save(card);  
  }

  async findAll(): Promise<Card[]> {
    return this.cardRepository.find();
  }

  async findAllByColumn(columnId: number): Promise<Card[]> {
    console.log('Trying to find column with id:', columnId);
    const column = await this.columnRepository.findOne({ where: { id: columnId } });
    if (!column) {
      console.log('Column not found');
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }

    return this.cardRepository.find({ where: { column: column } });
  }
}
