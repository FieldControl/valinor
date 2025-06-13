export interface IBoard {
    id: number;
    title: string;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBoardCreate {
    title: string;
}

export interface IBoardUpdate {
    id: number;
    title: string;
}
