import { ITask } from "./task.dto";

export interface IColumn {
    id: number;
    title: string;
    position: number;
    boardId: number;
    createdAt: Date;
    updatedAt: Date;
    tasks?: ITask[];
}

export interface IColumnCreate {
    title: string;
    position: number;
    boardId: number;
}