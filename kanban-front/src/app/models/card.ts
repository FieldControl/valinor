export interface Card {
    _id: string;
    name: string;
    description: string;
    createdAt: Date;
    dueDate: string;
    responsible: User;
    column: string;
}