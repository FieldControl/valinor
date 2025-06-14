export interface IColumn {
    id: number;
    title: string;
    position: number;
    boardId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IColumnCreate {
    title: string;
    position: number;
    boardId: number;
}