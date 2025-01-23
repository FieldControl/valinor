import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn } from '../column/column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(KanbanColumn)
    private columnRepository: Repository<KanbanColumn>,
  ) {}

  async createColumn(title: string): Promise<KanbanColumn> {
    if (!title) {
      throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
    }

    const column = this.columnRepository.create({ title });
    return await this.columnRepository.save(column);
  }

  async findAll(): Promise<KanbanColumn[]> {
    return this.columnRepository.find();
  }

  async findOne(id: number): Promise<KanbanColumn> {
    const column = await this.columnRepository.findOne({ where: { id } });
    if (!column) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }
    return column;
  }

  async update(id: number, title: string): Promise<KanbanColumn> {
    const column = await this.columnRepository.findOne({ where: { id } });
    if (!column) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }

    column.title = title;
    return await this.columnRepository.save(column);
  }

  async delete(id: number): Promise<void> {
    const result = await this.columnRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Column not found', HttpStatus.NOT_FOUND);
    }
  }
}
