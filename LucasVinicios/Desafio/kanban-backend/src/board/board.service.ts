// src/board/board.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) // Injeta o repositório da entidade Board
    private boardRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create(createBoardDto); // Cria uma nova instância de Board
    return this.boardRepository.save(board); // Salva no banco de dados
  }

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find(); // Retorna todos os boards
  }

  async findOne(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { id } }); // Busca um board pelo ID
    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.findOne(id); // Reutiliza findOne para verificar existência
    this.boardRepository.merge(board, updateBoardDto); // Mescla as alterações
    return this.boardRepository.save(board); // Salva as alterações
  }

  async remove(id: number): Promise<void> {
    const result = await this.boardRepository.delete(id); // Deleta o board pelo ID
    if (result.affected === 0) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
  }
}
