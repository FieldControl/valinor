// NestJS
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// TypeORM
import { Repository } from 'typeorm';
// Entities
import { Column } from './entities/column.entity';
// DTOs
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Column)
    private columnsRepository: Repository<Column>
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    const column = this.columnsRepository.create(createColumnDto);
    return await this.columnsRepository.save(column);
  }

  async findAll(): Promise<Column[]> {
    const columns = await this.columnsRepository.find({
      relations: ['cards'],
      order: { position: 'ASC', createdAt: 'ASC' },
    });

    // Ordenar cards dentro de cada coluna por posição
    columns.forEach((column) => {
      column.cards.sort((a, b) => a.position - b.position);
    });

    return columns;
  }

  async findOne(id: number): Promise<Column> {
    const column = await this.columnsRepository.findOne({
      where: { id },
      relations: ['cards'],
    });

    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    return column;
  }

  async update(id: number, updateColumnDto: UpdateColumnDto): Promise<Column> {
    const column = await this.findOne(id);
    Object.assign(column, updateColumnDto);
    return await this.columnsRepository.save(column);
  }

  async remove(id: number): Promise<void> {
    const column = await this.findOne(id);
    await this.columnsRepository.remove(column);
  }

  async updatePositions(
    columns: { id: number; position: number }[]
  ): Promise<Column[]> {
    const updatePromises = columns.map(({ id, position }) =>
      this.columnsRepository.update(id, { position })
    );

    await Promise.all(updatePromises);
    return await this.findAll();
  }
}
