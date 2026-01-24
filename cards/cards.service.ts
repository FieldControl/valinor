import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  private cards: Card[] = [];

  create(dto: CreateCardDto): Card {
    const newCard = { id: Date.now(), ...dto };
    this.cards.push(newCard);
    return newCard;
  }

  findAll(): Card[] {
    return this.cards;
  }
}
