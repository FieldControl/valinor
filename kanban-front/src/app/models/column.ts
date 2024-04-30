import { ICard } from "./card";

export interface IColumn {
    _id: string;
    name: string;
    cards: ICard[];
}