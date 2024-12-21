export declare class Task {
    id?: string;
    title?: string;
    description?: string;
    userId?: string;
    status?: number;
    data?: Date;
    constructor(id?: string, title?: string, description?: string, userId?: string, status?: number, data?: Date);
    getTasksByUserId(userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        userId: string;
        status: number;
        data: Date;
    }[]>;
    getTaskById(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        userId: string;
        status: number;
        data: Date;
    }>;
    postTask(task: Task): Promise<{
        id: string;
        title: string;
        description: string;
        userId: string;
        status: number;
        data: Date;
    }>;
    putTask(task: Task): Promise<{
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
