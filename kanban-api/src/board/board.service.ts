import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async createBoard(name: string): Promise<Board> {
    const newBoard = this.boardRepository.create({ name });
    return this.boardRepository.save(newBoard);
  }
  async deleteBoard(id: number): Promise<boolean> {
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) {
      throw new Error(`Quadro com id ${id} não encontrado`);
    }
    await this.boardRepository.remove(board);
    return true;
  }
  async updateBoard(id: number, name: string): Promise<Board> {
    const board = await this.boardRepository.findOneBy({ id });
    if (!board) {
      throw new Error(`Quadro com id ${id} não encontrado`);
    }
    board.name = name;
    await this.boardRepository.save(board);
    const updatedBoard = await this.boardRepository.findOne({
      where: { id },
      relations: ['columns', 'columns.cards'],
    });
    if (!updatedBoard) {
      throw new Error(`Quadro com id ${id} não encontrado após atualização`);
    }
    return updatedBoard;
  }
  async findAllBoards(): Promise<Board[]> {
   
    return this.boardRepository.find({
      relations: ['columns', 'columns.cards'],
    });
  }

  async findBoardById(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['columns', 'columns.cards'],
    });
    if (!board) {
      throw new Error(`Quadro com id ${id} não encontrado`);
    }
    return board;
  }
}
