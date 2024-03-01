import { Column } from "../columns/columns.model";
export declare class Board {
    name: string;
    columns: Column[];
    constructor(name: string, columns: Column[]);
}
