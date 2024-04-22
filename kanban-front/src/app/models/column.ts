import { Card } from "./card";

export interface Column {
    _id: string;
    name: string;
    cards: Card[];
}