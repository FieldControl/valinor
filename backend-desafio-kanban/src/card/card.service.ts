import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SwimlaneService } from 'src/swimlane/swimlane.service';
import { UserService } from 'src/user/user.service';
import { ReorderedCardDto } from './dto/reorder-cards.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private swimlaneService: SwimlaneService,
    private userService: UserService,
  ) {}

  async create(createCardDto: CreateCardDto, userCod: number) {
    const card = new Card();
    card.nameCard = createCardDto.nameCard;
    card.content = createCardDto.content;
    card.order = createCardDto.order;
    card.swimlaneCod = createCardDto.swimlaneCod;
    const hasAccessToSwimlane = await this.swimlaneService.hasAccessToSwimlane(
      createCardDto.swimlaneCod,
      userCod,
    );
    if (!hasAccessToSwimlane) {
      throw new UnauthorizedException('você não faz parte desse quadro.');
    }
    return this.cardRepository.save(card);
  }

  async updateCardOrdersAndSwimlanes(
    reorder: ReorderedCardDto,
    userCod: number,
  ) {
    await this.userService.isConnectedToBoard(userCod, reorder.boardCod);

    const promises = reorder.cards.map((Card) =>
      this.cardRepository.update(Card.idCard, {
        order: Card.order,
        swimlaneCod: Card.swimlaneCod,
      }),
    );

    await Promise.all(promises);

    return true;
  }

  async update(idCard: number, userCod: number, updateCardDto: UpdateCardDto) {
    await this.userService.isConnectedToSwimlane(
      userCod,
      updateCardDto.swimlaneCod,
    );
    return this.cardRepository.update(idCard, {
      nameCard: updateCardDto.nameCard,
      content: updateCardDto.content,
    });
  }

  async remove(idCard: number, userCod: number) {
    const card = await this.cardRepository.findOneBy({ idCard });
    await this.userService.isConnectedToSwimlane(userCod, card.swimlaneCod);
    return this.cardRepository.delete(idCard);
  }
}
