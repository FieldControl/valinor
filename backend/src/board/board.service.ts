import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) { }

  create(createBoardDto: CreateBoardDto) {
    const board = new Board();
    board.name = createBoardDto.name;
    return this.boardRepository.save(board);
  }

  findAllByUserId(userId: number) {
    return this.boardRepository.find({
      where: {
        users: { id: userId },
      },
      relations: ['users'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  update(id: number, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(id, {
      name: updateBoardDto.name,
    });
  }

  remove(id: number) {
    return this.boardRepository.delete(id);
  }
}
