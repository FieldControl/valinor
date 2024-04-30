import { ICard } from "./card";

export interface IUser {
    _id: string;
    name: string;
    email: string;
    cards: ICard[];
    creation: string;
}