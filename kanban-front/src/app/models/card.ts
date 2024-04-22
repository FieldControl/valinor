import { Column } from "./column";
import { User } from "./user";

export class Card {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    dueDate: string;
    responsible: User;
    responsibleName: string;
    column: Column;
    columnName: string

    constructor(card: Card) {
        this._id = card._id;
        this.name = card.name;
        this.description = card.description;
        this.createdAt = card.createdAt;
        this.dueDate = card.dueDate;
        this.responsible = card.responsible; 
        this.responsibleName = card.responsible.name; 
        this.column = card.column;
        this.columnName = card.column.name;
    }
}