import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto) {
    const board = new Board();
    board.name = createBoardDto.name;

    return this.boardRepository.save(board);
  }

  findOne(id: number) {
    return this.boardRepository.findOne({
      where: {
        id,
      },
      relations: ['columns', 'columns.cards'],
    });
  }

  findAll() {
    return this.boardRepository.find();
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(id, {
      name: updateBoardDto.name,
    });
  }

  async remove(id: number) {
    return this.boardRepository.delete(id);
  }
}
