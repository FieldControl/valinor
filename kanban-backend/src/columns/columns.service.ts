import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from './column.entity';
import { CreateColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
  ) {}

  //Buscar todas as colunas
  findAll() {
    return this.columnRepository.find({
      relations: ['cards'],
    });
  }

  // Criar coluna
  create(dto: CreateColumnDto) {
    const column = this.columnRepository.create({
      title: dto.title,
    });

    return this.columnRepository.save(column);
  }

  //Excluir coluna
  async delete(id: number) {
    const column = await this.columnRepository.findOne({
      where: { id },
    });

    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    await this.columnRepository.remove(column);
    return column;
  }
}
