import { IColumn } from "./column.dto";

export interface IBoard {
    id: number;
    title: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    columns?: IColumn[];
}

export interface IBoardCreate {
    title: string;
}

export interface IBoardUpdate {
    id: number;
    title: string;
}
