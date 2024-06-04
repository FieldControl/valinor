import { IUser } from "./user";

export interface ICard {
    _id: string;
    name: string;
    description: string;
    createdAt: Date;
    dueDate: Date;
    responsibles: IUser[];
    column: string;
    columnName: string
    position: number;
}