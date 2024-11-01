import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto'; // DTO para criação de board
import { UpdateBoardDto } from './dto/update-board.dto'; // DTO para atualização de board
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // Repositório do TypeORM
import { Board } from './entities/board.entity'; // Entidade do board
import { UserService } from 'src/user/user.service'; // Serviço de usuário

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) // Injeta o repositório do Board
    private boardRepository: Repository<Board>,
    private userService: UserService, // Injeta o serviço de usuário
  ) {}

  // Verifica se um usuário está associado a um board
  async isUserAssociatedWithBoard(boardId: number, userId: number) {
    const count = await this.boardRepository.count({
      where: { id: boardId, users: { id: userId } },
    });
    
    // Se o usuário não estiver associado, lança uma exceção de não autorizado
    if (count === 0) {
      throw new UnauthorizedException('User is not associated with board');
    }

    return true; // Retorna true se o usuário estiver associado
  }

  // Cria um novo board
  async create(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board();
    board.name = createBoardDto.name; // Define o nome do board

    // Busca o usuário que está criando o board
    const user = await this.userService.findOne(userId);
    board.users = [user]; // Associa o usuário ao board

    return this.boardRepository.save(board); // Salva o board no repositório
  }

  // Retorna todos os boards associados a um usuário
  findAllByUserId(userId: number) {
    return this.boardRepository.find({
      where: { users: { id: userId } },
      relations: ['users'], // Carrega os usuários associados
    });
  }

  // Busca um board específico por ID e verifica a associação do usuário
  findOne(id: number, userId: number) {
    return this.boardRepository.findOne({
      where: {
        id,
        users: { id: userId }, // Verifica se o usuário está associado
      },
      relations: ['users', 'swimlanes', 'swimlanes.cards'], // Carrega as relações necessárias
    });
  }

  // Atualiza um board existente
  async update(id: number, userId: number, updateBoardDto: UpdateBoardDto) {
    await this.isUserAssociatedWithBoard(id, userId); // Verifica a associação do usuário
    return this.boardRepository.update(id, {
      name: updateBoardDto.name, // Atualiza o nome do board
    });
  }

  // Remove um board
  async remove(id: number, userId: number) {
    await this.isUserAssociatedWithBoard(id, userId); // Verifica a associação do usuário
    return this.boardRepository.delete(id); // Deleta o board
  }
}
