import { Card } from './card.model';

export interface Column {
  id: number;
  title: string;
  isEditing?: boolean;
  cards?: Card[];
  order: number;
}