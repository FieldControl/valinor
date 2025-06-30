export interface CardModel{
    id: number;
    title: string;
    description: string;
    columnId: number;
  }

export interface ColumnModel{
    id: number;
    title: string;
    cards: CardModel[]
  }