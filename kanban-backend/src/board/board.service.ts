import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create(createBoardDto);
    return this.boardRepository.save(board);
  }

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find();
  }

  async findOne(id: number): Promise<Board> {
    return this.boardRepository.findOneBy({ id });
  }

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    await this.boardRepository.update(id, updateBoardDto);
    return this.boardRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.boardRepository.delete(id);
  }
}
