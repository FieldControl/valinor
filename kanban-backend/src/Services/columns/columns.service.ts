import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ColumnsDto } from '../../DTO/columns.dto';
import { Columns } from '../../Entities/columns.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Columns)
    private columnsRepository: Repository<Columns>,
  ) {}

  async createColumn(columnsDto: ColumnsDto): Promise<Columns> {
    const column = new Columns();
    column.title = columnsDto.title;

    return await this.columnsRepository.save(column);
  }

  async updateColumn(id: string, columnsDto: ColumnsDto): Promise<Columns> {
    const column = await this.columnsRepository.findOne({ where: { id } });
    if (!column) throw new Error('Column not found');

    column.title = columnsDto.title;

    return await this.columnsRepository.save(column);
  }

  async findAllColumns(): Promise<Columns[]> {
    return await this.columnsRepository.find();
  }

  async findOneColumn(id: string): Promise<Columns> {
    return await this.columnsRepository.findOne({ where: { id } });
  }

  async removeColumn(id: string): Promise<void> {
    await this.columnsRepository.delete(id);
  }
}
