// src/app/shared/models/column.model.ts
import { Card } from './card.model';

export interface Column {
  id: number;
  title: string;
  order: number;
  cards: Card[];
}
