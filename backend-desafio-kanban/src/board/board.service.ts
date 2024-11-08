import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private userService: UserService,
  ) {}

  async isUserAssociatedWithBoard(boardId: number, userId: number) {
    const count = await this.boardRepository.count({
      where: { idBoard: boardId, users: { idUser: userId } },
    });
    if (count == 0) {
      throw new UnauthorizedException(
        'o usuário não está associado com o quadro.',
      );
    }
    return true;
  }

  async create(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board();
    board.nameBoard = createBoardDto.name;
    const user = await this.userService.findOne(userId);
    board.users = [user];
    return this.boardRepository.save(board);
  }

  findAllByUserId(userId: number) {
    return this.boardRepository.find({
      where: {
        users: { idUser: userId },
      },
      relations: ['users'],
    });
  }

  findOne(idBoard: number, userId: number) {
    return this.boardRepository.findOne({
      where: {
        idBoard,
        users: { idUser: userId },
      },
      relations: ['users', 'swimlanes', 'swimlanes.cards'],
    });
  }

  async update(
    boardId: number,
    userId: number,
    updateBoardDto: UpdateBoardDto,
  ) {
    await this.isUserAssociatedWithBoard(boardId, userId);
    return this.boardRepository.update(boardId, {
      nameBoard: updateBoardDto.name,
    });
  }

  async remove(boardId: number, userId: number) {
    await this.isUserAssociatedWithBoard(boardId, userId);
    return this.boardRepository.delete(boardId);
  }
}
