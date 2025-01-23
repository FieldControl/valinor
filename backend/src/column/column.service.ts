import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn } from './column.entity';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(KanbanColumn)
    private columnRepository: Repository<KanbanColumn>,
  ) {}

  findAll(): Promise<KanbanColumn[]> {
    return this.columnRepository.find();
  }

  create(title: string): Promise<KanbanColumn> {
    const column = this.columnRepository.create({ title });
    return this.columnRepository.save(column);
  }
}