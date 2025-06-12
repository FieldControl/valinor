import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './columns.entity';

@Injectable()
export class ColumnsService implements OnModuleInit {
  constructor(
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
  ) {}

  async onModuleInit() {
    const existing = await this.columnRepository.find();
    if (existing.length === 0) {
      const defaultColumns = ['A Fazer', 'Em Progresso', 'Feito'];
      for (const [index, title] of defaultColumns.entries()) {
        const column = this.columnRepository.create({
          title,
          order: index,
        });
        await this.columnRepository.save(column);
      }
    }
  }

  findAll(): Promise<Column[]> {
    return this.columnRepository.find({
      relations: ['cards'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Column> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: ['cards'],
      order: {
        cards: {
          order: 'ASC',
        },
      },
    });

    if (!column) throw new Error(`Column with id ${id} not found`);
    return column;
  }
}
