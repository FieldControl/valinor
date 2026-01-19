export type CardPriority = 'BAIXA' | 'MEDIA' | 'ALTA';

export interface KanbanCard {
  id: number;
  title: string;
  description?: string;
  priority: CardPriority;
}

export interface KanbanColumn {
  id: number;
  title: string;
  cards: KanbanCard[];
}
