import { IColumn } from "./column";

export interface IBoard {
    _id: string;
    name: string;
    columns: IColumn[];
}