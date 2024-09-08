import {Card} from "./card.interface";

export class CreateColumnDto {
  id: string;
  order: number;
  title: string;
  cards: Card[];
}
