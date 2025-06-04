import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardColumn } from '../entities/column.entity';
import { CreateColumnDto } from './dto/create-column.dto';

    @Injectable()
    export class ColumnsService {
      constructor(
        @InjectRepository(BoardColumn)
        private columnsRepository: Repository<BoardColumn>,
      ) {}

      async findAll(): Promise<BoardColumn[]> {
        return this.columnsRepository.find({ relations: ['cards'] });
      }

      async findOne(id: number): Promise<BoardColumn> {
        const column = await this.columnsRepository.findOne({ where: { id }, relations: ['cards'] });
        if (!column) {
          throw new NotFoundException(`Column with ID ${id} not found.`);
        }
        return column;
      }

      async create(createColumnDto: CreateColumnDto): Promise<BoardColumn> {
        const newColumn = this.columnsRepository.create(createColumnDto);
        return this.columnsRepository.save(newColumn);
      }

      async remove(id: number): Promise<void> {
        const result = await this.columnsRepository.delete(id);
        if (result.affected === 0) {
          throw new NotFoundException(`Column with ID ${id} not found.`);
        }
      }
    }