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

  // Verifica se o usuário está associado ao board
  async isUserAssociatedWithBoard(boardId: number, userId: number) {
    const count = await this.boardRepository.count({
      where: { id: boardId, users: { id: userId } },
    });
    if (count === 0) {
      throw new UnauthorizedException('Usuário não associado ao board');
    }

    return true;
  }

  // Cria um novo board
  // O usuário que criou o board é associado a ele
  async create(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board();
    board.nome = createBoardDto.nome;
    const user = await this.userService.findOne(userId);
    board.users = [user];
    return this.boardRepository.save(board);
  }

  // Retorna todos os boards associados ao usuário
  findAllByUserId(userId: number) {
    return this.boardRepository.find({
      where: { users: { id: userId } },
      relations: ['users'],
    });
  }

  // Retorna um board específico associado ao usuário
  findOne(id: number, userId: number) {
    return this.boardRepository.findOne({
      where: {
        id,
        users: { id: userId },
      },
      relations: ['users', 'swimlanes', 'swimlanes.cards'],
    });
  }

  // Atualiza um board
  async update(id: number, userId: number, updateBoardDto: UpdateBoardDto) {
    await this.isUserAssociatedWithBoard(id, userId);
    return this.boardRepository.update(id, {
      nome: updateBoardDto.nome,
    });
  }

  // Remove um board
  async remove(id: number, userId: number) {
    await this.isUserAssociatedWithBoard(id, userId);
    return this.boardRepository.delete(id);
  }
}
