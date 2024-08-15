import { Card } from '../entities/card.entity';

export class ReorderedCardDto {
  //boardId: number;
  cards: Card[];
  boardId: number;
  //cardIds: number[];
}
