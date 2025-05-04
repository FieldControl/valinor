// frontend/src/app/board/column.model.ts
import { Card } from '../card/card.model';

export interface Column {
  id: number;
  title: string;
  cards: Card[];
}