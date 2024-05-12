export declare class Task {
    text: string;
    id: number;
    columnId: number;
}
export declare class Columns {
    id: number;
    name: string;
    tasks: Task[];
    boardId: number;
}
export declare class CreateBoards {
    id: number;
    name: string;
    columns: Columns[];
}
