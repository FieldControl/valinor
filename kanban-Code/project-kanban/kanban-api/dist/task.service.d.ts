import { PrismaService } from "./database/prisma.service";
import { Task } from "./dtos/create-board";
export declare class TaskService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    private readonly taskArray;
    getTask(): Promise<{
        id: number;
        text: string;
        columnId: number;
    }[]>;
    createTask(task: Task): Promise<{
        id: number;
        text: string;
        columnId: number;
    }>;
    deleteTask(task: Task): Promise<{
        id: number;
        text: string;
        columnId: number;
    }>;
}
