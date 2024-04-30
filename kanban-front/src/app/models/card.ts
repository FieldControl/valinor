import { IColumn } from "./column";
import { IUser } from "./user";

export interface ICard {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    dueDate: string;
    responsible: IUser;
    column: IColumn;
    columnName: string
}