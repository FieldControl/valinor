import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BoardService {

  //Constructor creation
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private userService: UserService,
  ) {}

  //Checks if user is associated with board
  async isUserAssociatedWithBoard(boardId: number, userId: number) {
    const count = await this.boardRepository.count({
      where: { id: boardId, users: { id: userId } },
    });
    if (count === 0) {
      throw new UnauthorizedException('User is not associated with board');
    }

    return true;
  }

  //Board creation
  async create(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board();
    board.name = createBoardDto.name;
    const user = await this.userService.findOne(userId);
    board.users = [user];
    return this.boardRepository.save(board);
  }

  //Get all user boards 
  findAllByUserId(userId: number) {
    return this.boardRepository.find({
      where: { users: { id: userId } },
      relations: ['users'],
    });
  }

  //Get one user board
  findOne(id: number, userId: number) {
    return this.boardRepository.findOne({
      where: {
        id,
        users: { id: userId },
      },
      relations: ['users', 'swimlanes', 'swimlanes.cards'],
    });
  }

  //Update user board
  async update(id: number, userId: number, updateBoardDto: UpdateBoardDto) {
    await this.isUserAssociatedWithBoard(id, userId);
    return this.boardRepository.update(id, {
      name: updateBoardDto.name,
    });
  }

  //Remove user board
  async remove(id: number, userId: number) {
    await this.isUserAssociatedWithBoard(id, userId);
    return this.boardRepository.delete(id);
  }
}
