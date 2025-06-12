import { ColumnModel } from "./column.model";

export interface CardModel {
    id: string;
    content: string;
    order: number;
    column: ColumnModel;
}