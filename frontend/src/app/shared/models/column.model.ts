import { Card } from './card.model';
export interface Column {
  id: number;
  title: string;
  order: number;
  cards: Card[];
}
