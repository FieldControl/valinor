export interface Card {
  id: string;
  title: string;
  text: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}
