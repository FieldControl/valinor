import { IUser } from "./user";

export interface IBoard {
    _id: string;
    name: string;
}

export interface ICreateBoard {
    name: string;
}