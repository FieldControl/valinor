import { Priority } from '../common/priority.type';

export interface Card {
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  priority: Priority;
  columnId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CardWithColumn extends Card {
  column?: {
    id: number;
    title: string;
    description?: string;
    position: number;
    color: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
