import { Card } from "./card.model";

export interface KanbanColumn {
    id: number;
    title: string;
    cards: Card[];
  }
  