import { Card } from "./card.interface";

export interface Column{
    id?: string;
    title: string
    cards: Card[];
}