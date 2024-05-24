import { ICard } from "./card";

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    cards: ICard[];
    creation: string;
}

export interface IRegister {
    name: string;
    email: string;
    password: string;
}

export interface ILogin {
    email: string;
    password: string;
}