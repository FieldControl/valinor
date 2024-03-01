import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Column)
    private columnsRepository: Repository<Column>,
  ) {}

  async findAll(): Promise<Column[]> {
    return this.columnsRepository.find({ relations: ['tasks'] });
  }

  async create(column: Column): Promise<Column> {
    return this.columnsRepository.save(column);
  }
}
