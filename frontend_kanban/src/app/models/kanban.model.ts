export interface CardModel{
    id: string;
    title: string;
    description: string;
    columnId: string;
  }

export interface ColumnModel{ 
    id: string;
    title: string;
    cards: CardModel[]
  }