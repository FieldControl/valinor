import { Card } from './card.model';

export interface Column {
  id: number;
  name: string;
  cards: Card[];
}
