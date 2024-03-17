import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnTable } from './columns.entity';
import { CreateColumnInput } from './dto/create-column.input';
import { UpdateColumnInput } from './dto/update-column.input';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnTable)
    private columnRepository: Repository<ColumnTable>,
  ) {}

  async findAllColumns(): Promise<ColumnTable[]> {
    const columns = await this.columnRepository.find();
    return columns;
  }

  async findColumnById(id: string): Promise<ColumnTable> {
    const column = await this.columnRepository.findOne({ where: { id } });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return column;
  }

  async createColumn(data: CreateColumnInput): Promise<ColumnTable> {
    const column = this.columnRepository.create(data);
    const columnSaved = await this.columnRepository.save(column);

    if (!columnSaved) {
      throw new InternalServerErrorException(
        'Error when creating a new column.',
      );
    }

    return columnSaved;
  }

  async updateColumn(
    id: string,
    data: UpdateColumnInput,
  ): Promise<ColumnTable> {
    const column = await this.findColumnById(id);

    const updatedColumn = { ...column, ...data };

    const cardUpdated = await this.columnRepository.save(updatedColumn);

    return cardUpdated;
  }

  async deleteColumn(id: string): Promise<boolean> {
    const column = await this.findColumnById(id);

    const deleted = await this.columnRepository.remove(column);

    if (deleted) {
      return true;
    }
    return false;
  }
}
