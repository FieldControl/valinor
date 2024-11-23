import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
  ) {}

  // Lista todas as colunas junto com seus cards
  findAll() {
    return this.columnRepository.find({ relations: ['cards'] });
  }

  // Cria uma nova coluna
  create(title: string) {
    const column = this.columnRepository.create({ title });
    return this.columnRepository.save(column);
  }

  // Exclui uma coluna por ID
  async delete(id: number) {
    const result = await this.columnRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Column not found');
    }
    return { message: 'Column deleted successfully' };
  }
}
