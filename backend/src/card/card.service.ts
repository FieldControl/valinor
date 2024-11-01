import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto'; // DTO para criação de cartão
import { UpdateCardDto } from './dto/update-card.dto'; // DTO para atualização de cartão
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity'; // Entidade do cartão
import { Repository } from 'typeorm'; // Repositório do TypeORM
import { SwimlaneService } from 'src/swimlane/swimlane.service'; // Serviço de swimlane
import { UserService } from 'src/user/user.service'; // Serviço de usuário
import { ReorderedCardDto } from './dto/reorder-cards.dto'; // DTO para reordenação de cartões

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) // Injeta o repositório do Card
    private cardRepository: Repository<Card>,
    private swimlaneService: SwimlaneService, // Injeta o serviço de swimlane
    private userService: UserService, // Injeta o serviço de usuário
  ) {}

  // Cria um novo cartão
  async create(createCardDto: CreateCardDto, userId: number) {
    const card = new Card(); // Cria uma nova instância de Card
    card.name = createCardDto.name; // Define o nome do cartão
    card.content = createCardDto.content; // Define o conteúdo do cartão
    card.swimlaneId = createCardDto.swimlaneId; // Define o ID da swimlane
    card.order = createCardDto.order; // Define a ordem do cartão

    // Verifica se o usuário tem acesso à swimlane
    const hasAccessToSwimlane = await this.swimlaneService.hasAccessToSwimlane(
      createCardDto.swimlaneId,
      userId,
    );
    if (!hasAccessToSwimlane) {
      throw new UnauthorizedException('You are not a part of this board.');
    }

    // Salva o cartão no repositório
    return this.cardRepository.save(card);
  }

  // Atualiza as ordens e swimlanes dos cartões
  async updateCardOrdersAndSwimlanes(
    reorder: ReorderedCardDto,
    userId: number,
  ) {
    // Verifica se o usuário está conectado ao board
    await this.userService.isConnectedToBoard(userId, reorder.boardId);

    // Atualiza as ordens e swimlanes dos cartões
    const promises = reorder.cards.map((card) =>
      this.cardRepository.update(card.id, {
        order: card.order,
        swimlaneId: card.swimlaneId,
      }),
    );

    await Promise.all(promises); // Aguarda todas as atualizações serem concluídas

    return true; // Retorna true se a operação for bem-sucedida
  }

  // Atualiza um cartão existente
  async update(id: number, userId: number, updateCardDto: UpdateCardDto) {
    // Verifica se o usuário está conectado à swimlane do cartão
    await this.userService.isConnectedToSwimlane(
      userId,
      updateCardDto.swimlaneId,
    );

    // Atualiza os detalhes do cartão
    return this.cardRepository.update(id, {
      name: updateCardDto.name,
      content: updateCardDto.content,
    });
  }

  // Remove um cartão
  async remove(id: number, userId: number) {
    // Busca o cartão pelo ID
    const card = await this.cardRepository.findOneBy({ id });

    // Verifica se o usuário está conectado à swimlane do cartão
    await this.userService.isConnectedToSwimlane(userId, card.swimlaneId);

    // Deleta o cartão
    return this.cardRepository.delete(id);
  }
}
