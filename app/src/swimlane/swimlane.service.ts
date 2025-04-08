import { Injectable } from '@nestjs/common'; // Importa o decorator Injectable do NestJS
import { CreateSwimlaneDto } from './dto/create-swimlane.dto'; // Importa o DTO para criar um swimlane
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto'; // Importa o DTO para atualizar um swimlane
import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorator InjectRepository do NestJS
import { Swimlane } from './entities/swimlane.entity'; // Importa a entidade Swimlane
import { Repository } from 'typeorm'; // Importa a classe Repository do TypeORM
import { UserService } from 'src/user/user.service'; // Importa o serviço UserService
import { ReorderedSwimlaneDto } from './dto/reorder-swimlane.dto'; // Importa o DTO para reordenar swimlanes

@Injectable() // Marca a classe como um provedor que pode ser injetado em outros lugares
export class SwimlaneService {
  // Injeta o repositório Swimlane e o serviço UserService no construtor
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>,
    private userService: UserService,
  ) {}

  async create(createSwimlaneDto: CreateSwimlaneDto, userId: number) { // Método para criar um novo swimlane
    const swimlane = new Swimlane(); // Cria uma nova instância da entidade Swimlane
    swimlane.name = createSwimlaneDto.name; // Define o nome do swimlane
    swimlane.order = createSwimlaneDto.order; // Define a ordem do swimlane
    swimlane.boardId = createSwimlaneDto.boardId; // Define o ID do board

    await this.userService.isConnectedToBoard(userId, swimlane.boardId); // Verifica se o usuário está conectado ao board
    return this.swimlaneRepository.save(swimlane); // Salva o swimlane no banco de dados
  }

  async updateSwimlaneOrders(reorder: ReorderedSwimlaneDto, userId: number) { // Método para atualizar a ordem dos swimlanes
    await this.userService.isConnectedToBoard(userId, reorder.boardId); // Verifica se o usuário está conectado ao board

    const promises = reorder.items.map((swimlane) => // Mapeia as swimlanes para promises, as promises (promessas) são objetos que representam a eventual conclusão (ou falha) de uma operação assíncrona e seu valor resultante.
      this.swimlaneRepository.update(swimlane.id, { order: swimlane.order }), // atualiza a ordem de cada swimlane no banco de dados
    );

    await Promise.all(promises); // Aguarda a conclusão de todas as promessas

    return true; // Retorna verdadeiro se a operação for bem-sucedida
  }

  async hasAccessToSwimlane(swimlaneId: number, userId: number) { // Método para verificar se o usuário tem acesso a um swimlane
    const hasAccess = await this.swimlaneRepository.count({ // Conta o número de swimlanes que atendem aos critérios especificados
      where: { // Condições para a contagem, onde o ID do swimlane e o ID do usuário no board devem corresponder aos valores fornecidos
        id: swimlaneId,
        board: { users: { id: userId } },
      },
    });

    return hasAccess > 0; // Retorna verdadeiro se o usuário tiver acesso ao swimlane, caso contrário, retorna falso
  }

  findAllByBoardId(boardId: number, userId: number) { // Método para encontrar todos os swimlanes por ID do board
    return this.swimlaneRepository.find({ // Encontra todos os swimlanes que atendem aos critérios especificados
      where: { // Condições para a busca, onde o ID do board e o ID do usuário no board devem corresponder aos valores fornecidos
        boardId,
        board: { users: { id: userId } },
      },
    });
  }

  async update( // Método para atualizar um swimlane
    // Parâmetros de entrada: ID do swimlane, ID do usuário e DTO de atualização do swimlane
    id: number,
    userId: number,
    updateSwimlaneDto: UpdateSwimlaneDto,
  ) {
    if (!updateSwimlaneDto.boardId) { // Se o ID do board não for fornecido, dispara o erro ""boardId is required"
      throw new Error("boardId is required");
    }
    await this.userService.isConnectedToBoard( // Verifica se o usuário está conectado ao board
      // ID do board e ID do usuário no board devem corresponder aos valores fornecidos
      userId,
      updateSwimlaneDto.boardId,
    );
    return this.swimlaneRepository.update(id, { // Atualiza o swimlane no banco de dados
      name: updateSwimlaneDto.name, // Atualiza o nome do swimlane
    });
  }

  async remove(id: number, userId: number) { // Método para remover um swimlane
    await this.userService.isConnectedToSwimlane(userId, id); // Verifica se o usuário está conectado ao swimlane
    return this.swimlaneRepository.delete(id); // Remove o swimlane do banco de dados
  }
}
