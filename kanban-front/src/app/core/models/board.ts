import { IUser } from "./user";

export interface IBoard {
    _id: string;
    name: string;
    responsibles: string[];
}

export interface ICreateBoard {
    name: string;
    responsibles: string[];
}