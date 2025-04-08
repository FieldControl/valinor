import { Injectable, UnauthorizedException } from '@nestjs/common'; // Importando os decorators e classes do NestJS
import { CreateBoardDto } from './dto/create-board.dto'; // Importando o DTO de criação de board
import { UpdateBoardDto } from './dto/update-board.dto'; // Importando o DTO de atualização de board
import { InjectRepository } from '@nestjs/typeorm'; // Importando o decorator para injeção de repositório
import { Repository } from 'typeorm'; // Importando a classe Repository do TypeORM
import { Board } from './entities/board.entity'; // Importando a entidade Board
import { UserService } from 'src/user/user.service'; // Importando o serviço de usuário

@Injectable() // Decorator que indica que a classe pode ser injetada em outros lugares
export class BoardService { // Classe de serviço para gerenciar boards
  constructor( // Injetando o repositório de Board e o serviço de usuário
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
    private userService: UserService,
  ) {}

  async isUserAssociatedWithBoard(boardId: number, userId: number) { // Método para verificar se o usuário está associado a um board
    const count = await this.boardRepository.count({ // Contando o número de boards associados ao usuário
      where: { id: boardId, users: { id: userId } }, // Condição de contagem: o board deve ter o id passado e o usuário deve ter o id passado
    });
    if (count === 0) { // Se o usuário não estiver associado ao board
      throw new UnauthorizedException('O usuário não está associado ao board');
    }

    return true; // Se o usuário estiver associado, retorna true
  }

  async create(createBoardDto: CreateBoardDto, userId: number) { // Método para criar um novo board
    const board = new Board(); // Criando uma nova instância de Board
    board.name = createBoardDto.name; // Atribuindo o nome do board a partir do DTO
    const user = await this.userService.findOne(userId); // Buscando o usuário pelo id
    board.users = [user!]; // Associando o usuário ao board, o operador de asserção não nula indica que o valor não é nulo ou indefinido
    return this.boardRepository.save(board); // Salvando o board no repositório
  }

  findAllByUserId(userId: number) { // Método para encontrar todos os boards associados a um usuário
    return this.boardRepository.find({ // Buscando todos os boards
      where: { users: { id: userId } }, // Condição de busca: o usuário deve ter o id passado
      relations: ['users'], // Carregando a relação de usuários
    });
  }

  findOne(id: number, userId: number) { // Método para encontrar um board específico associado a um usuário
    return this.boardRepository.findOne({ // Buscando um board específico
      where: { // Condição de busca: o board deve ter o id passado e o usuário deve ter o id passado
        id,
        users: { id: userId },
      },
      relations: ['users', 'swimlanes', 'swimlanes.cards'], // Carregando as relações de usuários, swimlanes e cards
    });
  }

  async update(id: number, userId: number, updateBoardDto: UpdateBoardDto) { // Método para atualizar um board
    await this.isUserAssociatedWithBoard(id, userId); // Verificando se o usuário está associado ao board
    return this.boardRepository.update(id, { // Atualizando o board
      name: updateBoardDto.name, // Atribuindo o novo nome do board a partir do DTO
    });
  }

  async remove(id: number, userId: number) { // Método para remover um board
    await this.isUserAssociatedWithBoard(id, userId); // Verificando se o usuário está associado ao board
    return this.boardRepository.delete(id); // Removendo o board do repositório
  }
}
