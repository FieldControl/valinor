import { Icolumn } from "./column.interface";
import { IUser } from "./user.interfaces";

// export interface Icard{
//     id: Number;
//     title: string;
//     content: string;
//     order: number;
//     delegate?: IUser;
//     columnId: number;
//     column?: Icolumn;
// }

export interface Icard {
    id: number;
    name: string;
    content: string;
    order: number;
    assigne?: IUser;
    columnId: number;
    boardId: number;
    column: Icolumn;
  }