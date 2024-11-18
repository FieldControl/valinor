import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './column.entity';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
  ) {}

  create(name: string): Promise<Column> {
    const column = this.columnRepository.create({ name });
    return this.columnRepository.save(column);
  }

  findAll(): Promise<Column[]> {
    return this.columnRepository.find({ relations: ['cards'] });
  }
}
