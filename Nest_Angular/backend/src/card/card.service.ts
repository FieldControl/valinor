import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { UserService } from 'src/user/user.service';
import { ReorderedCardDto } from './dto/reorder-cards.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private swimlaneService: SwimlaneService,
    private userService: UserService,
  ) { }

  // Cria um novo card
  // Verifica se o usuário tem acesso à swimlane onde o card será criado 
  // Se não tiver acesso, retorna um erro de não autorizado 
  async create(createCardDto: CreateCardDto, userId: number) {
    const card = new Card();
    card.nome = createCardDto.nome;
    card.conteudo = createCardDto.conteudo;
    card.swimlaneId = createCardDto.swimlaneId;
    card.ordem = createCardDto.ordem;
    const hasAccessToSwimlane = await this.swimlaneService.hasAccessToSwimlane(
      createCardDto.swimlaneId,
      userId,
    );
    if (!hasAccessToSwimlane) {
      throw new UnauthorizedException('You are not a part of this board.');
    }
    return this.cardRepository.save(card);
  }

  // Atualiza a ordem dos cards
  // Verifica se o usuário tem acesso ao board onde o card será movido
  // Se não tiver acesso, retorna um erro de não autorizado
  async updateCardOrdersAndSwimlanes(
    reorder: ReorderedCardDto,
    userId: number
  ) {
    await this.userService.isConnectedToBoard(userId, reorder.boardId);

    const promises = reorder.cards.map((card) =>
      this.cardRepository.update(card.id, {
        ordem: card.ordem,
        swimlaneId: card.swimlaneId,
      })
    )

    await Promise.all(promises);

    return true;
  }

  // Atualiza um card
  // Verifica se o usuário tem acesso à swimlane onde o card será atualizado
  // Retorna o card atualizado

  async update(id: number, userId: number, updateCardDto: UpdateCardDto) {
    await this.userService.isConnectedToSwimlane(
      userId,
      updateCardDto.swimlaneId
    );
    return this.cardRepository.update(id, {
      nome: updateCardDto.nome,
      conteudo: updateCardDto.conteudo,
    });
  }

  // Remove um card
  async remove(id: number, userId: number) {
    const card = await this.cardRepository.findOneBy({id});
    await this.userService.isConnectedToSwimlane( userId, card.swimlaneId
    );
    return this.cardRepository.delete({id});
  }
}
