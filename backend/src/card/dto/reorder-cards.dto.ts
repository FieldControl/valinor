import { Card } from '../entities/card.entity';

//Reorder cards class
export class ReorderedCardDto {
  boardId: number;
  cards: Card[];
}
