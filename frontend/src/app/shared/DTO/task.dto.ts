export interface ITask {
    id: number;
    title: string;
    columnId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITaskCreate {
    title: string;
    columnId: number;
}