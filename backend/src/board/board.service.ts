import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private userService: UserService,
  ) { }

  async create(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board();
    board.name = createBoardDto.name;
    const user = await this.userService.findOne(userId);
    board.users = [user];
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

  findOne(id: number, userId: number) {
    return this.boardRepository.findOne({
      where: {
        id,
        users: { id: userId },
      },
      relations: ['users', 'swimlanes', 'swimlanes.cards'],
    });
  }

  update(id: number, userId: number, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(
      {
        id,
        users: { id: userId },
      },
      {
        name: updateBoardDto.name,
      }
    );
  }

  remove(id: number, userId: number) {
    return this.boardRepository.delete({
      id,
      users: { id: userId },
    });
  }
}
