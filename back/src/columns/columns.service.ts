import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanColumn } from './column.entity'; 

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(KanbanColumn)
    private columnRepository: Repository<KanbanColumn>,
  ) {}

  findAll(): Promise<KanbanColumn[]> {
    return this.columnRepository.find({ relations: ['cards'] });
  }

  async findOne(id: number): Promise<KanbanColumn> {
    return this.columnRepository.findOne({ where: { id }, relations: ['cards'] });
  }

  create(title: string, order: number): Promise<KanbanColumn> {
    const column = this.columnRepository.create({ title, order }); 
    return this.columnRepository.save(column);
  }

  async update(id: number, title: string, order: number): Promise<KanbanColumn> {
    await this.columnRepository.update(id, { title, order }); 
    return this.columnRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.columnRepository.delete(id);
  }

  async updateColumnsOrder(columns: KanbanColumn[]): Promise<KanbanColumn[]> {
    const updatedColumns = [];
    for (const column of columns) {
      const updatedColumn = await this.columnRepository.save(column);
      updatedColumns.push(updatedColumn);
    }
    return updatedColumns;
  }
  
}
