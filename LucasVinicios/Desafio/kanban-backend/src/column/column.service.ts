// src/column/column.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from '../entidades/column.entity';
import { Board } from '../entidades/board.entity'; // Importe a entidade Board
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(ColumnEntity)
    private columnRepository: Repository<ColumnEntity>,
    @InjectRepository(Board) // Injeta o repositório da entidade Board
    private boardRepository: Repository<Board>,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<ColumnEntity> {
    const { boardId, title, order } = createColumnDto;

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }

    const newColumn = this.columnRepository.create({
      title,
      order,
      board, // Associa a coluna ao board encontrado
    });
    return this.columnRepository.save(newColumn);
  }

  async findAll(): Promise<ColumnEntity[]> {
    return this.columnRepository.find({ relations: ['board', 'cards'] }); // Inclui o Board e Cards relacionados
  }

  async findOne(id: number): Promise<ColumnEntity> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: ['board', 'cards'], // Inclui o Board e Cards relacionados
    });
    if (!column) {
      throw new NotFoundException(`Column with ID "${id}" not found.`);
    }
    return column;
  }

  async update(
    id: number,
    updateColumnDto: UpdateColumnDto,
  ): Promise<ColumnEntity> {
    const column = await this.findOne(id); // Usa o findOne para verificar existência e carregar relações

    // Se houver boardId no DTO, verifica se o board existe
    if (updateColumnDto.boardId) {
      const board = await this.boardRepository.findOne({
        where: { id: updateColumnDto.boardId },
      });
      if (!board) {
        throw new NotFoundException(
          `Board with ID "${updateColumnDto.boardId}" not found.`,
        );
      }
      column.board = board; // Atualiza a associação do board
    }

    this.columnRepository.merge(column, updateColumnDto);
    return this.columnRepository.save(column);
  }

  async remove(id: number): Promise<void> {
    const result = await this.columnRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Column with ID "${id}" not found.`);
    }
  }

  // Método para obter colunas de um board específico (útil para o frontend)
  async findColumnsByBoard(boardId: number): Promise<ColumnEntity[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (!board) {
      throw new NotFoundException(`Board with ID "${boardId}" not found.`);
    }
    return this.columnRepository.find({
      where: { board: { id: boardId } },
      relations: ['cards'], // Inclui os cards dentro de cada coluna
      order: { order: 'ASC' }, // Ordena as colunas pela propriedade 'order'
    });
  }
}
