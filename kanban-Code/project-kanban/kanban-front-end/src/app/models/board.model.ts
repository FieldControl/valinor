import { column } from "./column.model";


export class board{
    constructor(public name: string, public columns: column[]) {}
}