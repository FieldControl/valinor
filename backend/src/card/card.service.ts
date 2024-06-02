import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto'; // Importa o DTO para criar um card
import { UpdateCardDto } from './dto/update-card.dto'; // Importa o DTO para atualizar um card
import { InjectRepository } from '@nestjs/typeorm'; // Importa o decorator para injetar o repositório
import { Card } from './entities/card.entity'; // Importa a entidade Card
import { Repository } from 'typeorm'; // Importa a interface Repository do TypeORM
import { SwimlaneService } from 'src/swimlane/swimlane.service'; // Importa o serviço SwimlaneService para verificar o acesso à swimlane
import { UserService } from 'src/user/user.service'; // Importa o serviço UserService para verificar o acesso do usuário
import { ReorderedCardDto } from './dto/reorder-cards.dto'; // Importa o DTO para reordenar os cards

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>, // Injeta o repositório Card
    private swimlaneService: SwimlaneService, // Injeta o serviço SwimlaneService
    private userService: UserService, // Injeta o serviço UserService
  ) {}

  // Método para criar um novo card
  async create(createCardDto: CreateCardDto, userId: number) {
    const card = new Card(); // Cria uma nova instância de Card
    // Define os campos do card com base nos dados do DTO
    card.name = createCardDto.name;
    card.content = createCardDto.content;
    card.swimlaneId = createCardDto.swimlaneId;
    card.order = createCardDto.order;
    card.date = createCardDto.date;
    card.userName = createCardDto.userName;
    card.quantUsers = createCardDto.quantUsers;
    card.color = createCardDto.color;
    // Verifica se o usuário tem acesso à swimlane associada ao card
    const hasAccessToSwimlane = await this.swimlaneService.hasAccessToSwimlane(
      createCardDto.swimlaneId,
      userId,
    );
    // Se o usuário não tiver acesso à swimlane, lança uma exceção de não autorizado
    if (!hasAccessToSwimlane) {
      throw new UnauthorizedException('You are not a part of this board.');
    }
    // Salva o card no banco de dados
    return this.cardRepository.save(card);
  }

  // Método para atualizar a ordem dos cards e das swimlanes
  async updateCardOrdersAndSwimlanes(
    reorder: ReorderedCardDto,
    userId: number,
  ) {
    // Verifica se o usuário está conectado à placa associada aos cards
    await this.userService.isConnectedToBoard(userId, reorder.boardId);
    // Cria uma série de promessas para atualizar a ordem dos cards no banco de dados
    const promises = reorder.cards.map((card) =>
      this.cardRepository.update(card.id, {
        order: card.order,
        swimlaneId: card.swimlaneId,
      }),
    );
    // Executa todas as promessas em paralelo
    await Promise.all(promises);
    // Retorna true para indicar que a operação foi bem-sucedida
    return true;
  }

  // Método para atualizar um card existente
  async update(id: number, userId: number, updateCardDto: UpdateCardDto) {
    // Verifica se o usuário está conectado à swimlane associada ao card
    await this.userService.isConnectedToSwimlane(
      userId,
      updateCardDto.swimlaneId,
    );
    // Atualiza os campos do card no banco de dados com base nos dados do DTO
    return this.cardRepository.update(id, {
      name: updateCardDto.name,
      content: updateCardDto.content,
      date: updateCardDto.date,
      userName: updateCardDto.userName,
      quantUsers: updateCardDto.quantUsers,
      color: updateCardDto.color,
    });
  }

  // Método para remover um card existente
  async remove(id: number, userId: number) {
    const card = await this.cardRepository.findOneBy({ id });
    // Verifica se o usuário está conectado à swimlane associada ao card
    await this.userService.isConnectedToSwimlane(userId, card.swimlaneId);
    // Remove o card do banco de dados
    return this.cardRepository.delete(id);
  }
}
