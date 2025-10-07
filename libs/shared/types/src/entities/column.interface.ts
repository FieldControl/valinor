import { Card } from './card.interface';

export interface Column {
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}
