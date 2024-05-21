import { ICard } from "./card";

export interface IColumn {
    _id: string;
    name: string;
    cards: ICard[];
    board: string;
}

export interface ICreateColumn {
    name: string;
    board: string;
}