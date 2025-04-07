import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardColumn } from './board.entity';
import { Card } from '../card/card.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardColumn) private columnRepo: Repository<BoardColumn>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
  ) {}

  getColumns() {
    return this.columnRepo.find({ relations: ['cards'] });
  }

  async createColumn(data: { title: string }) {
    const column = this.columnRepo.create(data);
    return await this.columnRepo.save(column);
  }

  async createCard(columnId: number, data: { title: string; description: string }) {
    const column = await this.columnRepo.findOne({ where: { id: columnId } });
    if (!column) throw new Error('Coluna não encontrada');

    const card = this.cardRepo.create({ ...data, column });
    return await this.cardRepo.save(card);
  }
}
