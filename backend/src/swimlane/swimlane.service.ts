import { Injectable } from '@nestjs/common';
import { CreateSwimlaneDto } from './dto/create-swimlane.dto'; // Importa o DTO para criar uma nova swimlane
import { UpdateSwimlaneDto } from './dto/update-swimlane.dto'; // Importa o DTO para atualizar uma swimlane
import { InjectRepository } from '@nestjs/typeorm';
import { Swimlane } from './entities/swimlane.entity'; // Importa a entidade Swimlane
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service'; // Importa o serviço de usuário
import { ReordereSwimlaneDto } from './dto/reorder-swimlane.dto'; // Importa o DTO para reordenar as swimlanes
import { Card } from 'src/card/entities/card.entity'; // Importa a entidade Card

@Injectable()
export class SwimlaneService {
  constructor(
    @InjectRepository(Swimlane)
    private swimlaneRepository: Repository<Swimlane>, // Repositório para interações com o banco de dados relacionadas às swimlanes
    @InjectRepository(Card)
    private cardRepository: Repository<Card>, // Repositório para interações com o banco de dados relacionadas aos cards
    private userService: UserService, // Serviço para operações relacionadas aos usuários
  ) {}

  // Método para criar uma nova swimlane
  async create(createSwimlaneDto: CreateSwimlaneDto, userId: number) {
    const swimlane = new Swimlane(); // Cria uma nova instância de Swimlane
    swimlane.name = createSwimlaneDto.name; // Define o nome da swimlane
    swimlane.order = createSwimlaneDto.order; // Define a ordem da swimlane
    swimlane.boardId = createSwimlaneDto.boardId; // Define o ID da placa à qual a swimlane pertence

    // Verifica se o usuário está conectado à placa à qual a swimlane pertence
    await this.userService.isConnectedToBoard(userId, swimlane.boardId);
    
    // Salva a nova swimlane no banco de dados
    return this.swimlaneRepository.save(swimlane);
  }

  // Método para atualizar a ordem das swimlanes
  async updateSwimlaneOrders(reorder: ReordereSwimlaneDto, userId: number) {
    // Verifica se o usuário está conectado à placa à qual as swimlanes pertencem
    await this.userService.isConnectedToBoard(userId, reorder.boardId);

    // Atualiza a ordem de cada swimlane
    const promises = reorder.items.map((swimlane) =>
      this.swimlaneRepository.update(swimlane.id, { order: swimlane.order }),
    );

    await Promise.all(promises);

    return true;
  }

  // Método para verificar se o usuário tem acesso a uma swimlane específica
  async hasAccessToSwimlane(swimlaneId: number, userId: number) {
    // Verifica se o usuário está associado à placa à qual a swimlane pertence
    const hasAccess = await this.swimlaneRepository.count({
      where: {
        id: swimlaneId,
        board: { users: { id: userId } },
      },
    });

    return hasAccess > 0; // Retorna verdadeiro se o usuário tiver acesso à swimlane
  }

  // Método para buscar todas as swimlanes de uma placa específica
  findAllByBoardId(boardId: number, userId: number) {
    // Busca as swimlanes que pertencem à placa e ao usuário específicos
    return this.swimlaneRepository.find({
      where: {
        boardId,
        board: { users: { id: userId } },
      },
    });
  }

  // Método para atualizar uma swimlane existente
  async update(
    id: number,
    userId: number,
    updateSwimlaneDto: UpdateSwimlaneDto,
  ) {
    // Verifica se o usuário está conectado à placa à qual a swimlane pertence
    await this.userService.isConnectedToBoard(
      userId,
      updateSwimlaneDto.boardId,
    );

    // Atualiza os dados da swimlane no banco de dados
    return this.swimlaneRepository.update(id, {
      name: updateSwimlaneDto.name,
    });
  }

  // Método para remover uma swimlane existente
  async remove(id: number, userId: number) {
    // Verifica se o usuário está conectado à swimlane que está sendo removida
    await this.userService.isConnectedToSwimlane(userId, id);

    // Remove a swimlane do banco de dados
    return this.swimlaneRepository.delete(id);
  }
}
