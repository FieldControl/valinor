import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto'; // Importa o DTO para criar um quadro
import { UpdateBoardDto } from './dto/update-board.dto'; // Importa o DTO para atualizar um quadro
import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorador para injetar o repositório do TypeORM
import { Repository } from 'typeorm'; // Importa o tipo de repositório do TypeORM
import { Board } from './entities/board.entity'; // Importa a entidade Board para definir o tipo de dados para os quadros
import { UserService } from 'src/user/user.service'; // Importa o serviço de usuário para interagir com os dados do usuário
import { Swimlane } from 'src/swimlane/entities/swimlane.entity'; // Importa a entidade Swimlane para definir o tipo de dados para as swimlanes

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) // Injeta o repositório do TypeORM para a entidade Board
    private boardRepository: Repository<Board>, // Define o repositório para interagir com os dados do quadro
    private userService: UserService, // Injeta o serviço de usuário para interagir com os dados do usuário
  ) {}

  // Verifica se o usuário está associado a um determinado quadro
  async isUserAssociatedWithBoard(boardId: number, userId: number) {
    const count = await this.boardRepository.count({
      where: { id: boardId, users: { id: userId } }, // Conta o número de ocorrências onde o ID do quadro e o ID do usuário correspondem
    });
    if (count === 0) {
      throw new UnauthorizedException('User is not associated with board'); // Lança uma exceção se o usuário não estiver associado ao quadro
    }

    return true; // Retorna verdadeiro se o usuário estiver associado ao quadro
  }

  // Cria um novo quadro com base nos dados fornecidos e no ID do usuário
  async create(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board(); // Cria uma nova instância de Board
    board.name = createBoardDto.name; // Define o nome do quadro com base nos dados fornecidos
    const user = await this.userService.findOne(userId); // Obtém o usuário com o ID fornecido
    board.users = [user]; // Associa o usuário ao quadro
    return this.boardRepository.save(board); // Salva o novo quadro no banco de dados
  }

  // Encontra todos os quadros associados a um usuário específico com base no ID do usuário
  findAllByUserId(userId: number) {
    return this.boardRepository.find({
      where: { users: { id: userId } }, // Encontra os quadros onde o ID do usuário corresponde
      relations: ['users'], // Inclui as relações com os usuários
    });
  }

  // Encontra um quadro específico por ID e usuário
  findOne(id: number, userId: number) {
    return this.boardRepository.findOne({
      where: {
        id,
        users: { id: userId },
      }, // Encontra o quadro onde o ID do quadro e o ID do usuário correspondem
      relations: ['users', 'swimlanes', 'swimlanes.cards'], // Inclui as relações com usuários, swimlanes e cards
    });
  }

  // Atualiza um quadro existente com base no ID fornecido e no DTO de atualização
  async update(id: number, userId: number, updateBoardDto: UpdateBoardDto) {
    await this.isUserAssociatedWithBoard(id, userId); // Verifica se o usuário está associado ao quadro
    return this.boardRepository.update(id, {
      name: updateBoardDto.name,
    }); // Atualiza o nome do quadro com base nos dados fornecidos
  }

  // Remove um quadro existente com base no ID fornecido
  async remove(id: number, userId: number) {
    await this.isUserAssociatedWithBoard(id, userId); // Verifica se o usuário está associado ao quadro
    return this.boardRepository.delete(id); // Remove o quadro do banco de dados
  }
}
