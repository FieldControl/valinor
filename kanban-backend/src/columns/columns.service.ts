import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn } from './column.entity/column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(KanbanColumn)
    private columnsRepository: Repository<KanbanColumn>,
  ) {}

  findAll(): Promise<KanbanColumn[]> {
    return this.columnsRepository.find({ relations: ['cards'] });
  }

  findOne(id: number): Promise<KanbanColumn> {
    return this.columnsRepository.findOne({ where: { id }, relations: ['cards'] });
  }

  create(column: KanbanColumn): Promise<KanbanColumn> {
    return this.columnsRepository.save(column);
  }

  async update(id: number, column: KanbanColumn): Promise<KanbanColumn> {
    await this.columnsRepository.update(id, column);
    return this.columnsRepository.findOne({ where: { id }, relations: ['cards'] });
  }

  async remove(id: number): Promise<void> {
    await this.columnsRepository.delete(id);
  }
}
