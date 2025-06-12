export interface Card {
  id: number;
  title: string;
  description?: string;
  order: number;
}

export interface Column {
  id: number;
  title: string;
  order: number;
  cards: Card[];
}
