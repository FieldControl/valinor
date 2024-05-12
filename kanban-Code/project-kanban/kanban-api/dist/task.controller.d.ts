import { TaskService } from "./task.service";
import { Task } from "./dtos/create-board";
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    getTask(): Promise<{
        id: number;
        text: string;
        columnId: number;
    }[]>;
    createTask(tasks: Task): Promise<{
        id: number;
        text: string;
        columnId: number;
    }>;
    deleteTask(tasks: Task): Promise<{
        id: number;
        text: string;
        columnId: number;
    }>;
}
