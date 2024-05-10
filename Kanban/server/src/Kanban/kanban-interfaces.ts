export interface Column {
    id: number;
    name: string;
    cards: Card[];
}

export interface Card {
    id: number;
    title: string;
    description: string;
}