
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './column.entity';
import { Board } from '../board/board.entity'; 

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>, 
  ) {}

  async createColumn(title: string, boardId: number): Promise<Column> {
    const board = await this.boardRepository.findOneBy({ id: boardId }); 
    if (!board) {
      throw new Error('Quadro não encontrado!');
    }
    const newColumn = this.columnRepository.create({ title, board });
    return this.columnRepository.save(newColumn);
  }

  async findAllColumnsByBoardId(boardId: number): Promise<Column[]> {
    return this.columnRepository.find({
      where: { board: { id: boardId } },
      relations: ['cards'], 
    });
  }

  async deleteColumn(id: number): Promise<void> {
    const column = await this.columnRepository.findOneBy({ id });
    if (!column) {
      throw new Error('Coluna não encontrada!');
    }
    await this.columnRepository.remove(column);
  }

  async updateColumn(id: number, title: string): Promise<Column> {
    const column = await this.columnRepository.findOneBy({ id });
    if (!column) {
      throw new Error('Coluna não encontrada!');
    }
    column.title = title;
    return this.columnRepository.save(column);
  }

  async findAllColumns(): Promise<Column[]> {
    return this.columnRepository.find();
  }

  async findColumnById(id: number): Promise<Column> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: ['columns', 'columns.cards'],
    });
    if (!column) {
      throw new Error('Coluna não encontrada!');
    }
    return column;
  }
}
