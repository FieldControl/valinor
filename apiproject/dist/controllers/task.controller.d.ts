import { Task } from "src/models/task.service";
export declare class TaskController {
    postTask(body: Task): Promise<{
        id: string;
        title: string;
        description: string;
        userId: string;
        status: number;
        data: Date;
    }>;
    getTasks(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        userId: string;
        status: number;
        data: Date;
    }[]>;
    putTask(id: string, body: Task): Promise<{
        id: string;
        title: string;
        description: string;
        userId: string;
        status: number;
        data: Date;
    }>;
    deleteTask(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        userId: string;
        status: number;
        data: Date;
    }>;
}
