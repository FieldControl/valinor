import { CardModel } from "./card.model";

export interface ColumnModel {
    id: string;
    title: string;
    order: number;
    cards: CardModel[];
}