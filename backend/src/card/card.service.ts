import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { SwimlaneService } from 'src/swimlane/swimlane.service';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    private swimlaneService: SwimlaneService,
  ) { }

  async create(createCardDto: CreateCardDto, userId: number) {
    const card = new Card();
    card.name = createCardDto.name;
    card.content = createCardDto.content;
    card.order = createCardDto.order;
    card.swimlaneId = createCardDto.swimlaneId;
    const hasAccessToSwimlane = await this.swimlaneService.hasAccessToSwimlane(
      createCardDto.swimlaneId,
      userId,
    );

    if (!hasAccessToSwimlane) {
      throw new UnauthorizedException('You are not a part of this board.')
    }

    return this.cardRepository.save(card);
  }

  update(id: number, userId: number, updateCardDto: UpdateCardDto) {
    return this.cardRepository.update(
      {
        id,
        swimlane: {
          board: { users: { id: userId } },
        }
      },
      {
        name: updateCardDto.name,
        content: updateCardDto.content,
      },
    );
  }

  remove(id: number, userId: number) {
    return this.cardRepository.delete({
      id,
      swimlane: {
        board: {
          users: { id: userId },
        },
      },
    });
  }
}
