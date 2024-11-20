import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './column.entity';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
  ) {}

  /*create(name: string): Promise<Column> {
    const column = this.columnRepository.create({ name });
    return this.columnRepository.save(column);
  }*/

  findAll(): Promise<Column[]> {
    return this.columnRepository.find({ relations: ['cards'] });
  }

  create(columnData: Partial<Column>): Promise<Column> {
    const column = this.columnRepository.create(columnData);
    return this.columnRepository.save(column);
  }

  async remove(id: number): Promise<void> {
    await this.columnRepository.delete(id);
  }
}
