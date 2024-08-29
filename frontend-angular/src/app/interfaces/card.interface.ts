import { Icolumn } from "./column.interface";
import { IUser } from "./user.interfaces";

export interface Icard{
    id: Number;
    title: string;
    content: string;
    order: number;
    delegate: IUser[];
    columnsId: number;
    column: Icolumn[];
}