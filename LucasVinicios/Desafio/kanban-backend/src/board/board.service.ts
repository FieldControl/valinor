// src/board/board.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entidades/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) 
    private boardRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create(createBoardDto); 
    return this.boardRepository.save(board); 
  }

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find(); 
  }

  async findOne(id: number): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { id } }); 
    if (!board) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.findOne(id); 
    this.boardRepository.merge(board, updateBoardDto); 
    return this.boardRepository.save(board); 
  }

  async remove(id: number): Promise<void> {
    const result = await this.boardRepository.delete(id); 
    if (result.affected === 0) {
      throw new NotFoundException(`Board with ID "${id}" not found`);
    }
  }
}
