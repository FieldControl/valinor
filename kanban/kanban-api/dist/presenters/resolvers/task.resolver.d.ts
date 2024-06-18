import { TaskService } from '../../application/services/task.service';
import { CreateTaskInput } from '@application/dto/taskDto/create-task.input';
import { UpdateTaskInput, UpdateTasksInput } from '@application/dto/taskDto/update-task.input';
export declare class TaskResolver {
    private readonly taskService;
    constructor(taskService: TaskService);
    createTask(createTaskInput: CreateTaskInput): Promise<{
        column: {
            id: string;
            title: string;
            description: string;
            projectId: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        title: string;
        description: string;
        columnId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        column: {
            id: string;
            title: string;
            description: string;
            projectId: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        title: string;
        description: string;
        columnId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        column: {
            id: string;
            title: string;
            description: string;
            projectId: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        title: string;
        description: string;
        columnId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTask(updateTaskInput: UpdateTaskInput): Promise<{
        column: {
            id: string;
            title: string;
            description: string;
            projectId: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        title: string;
        description: string;
        columnId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTasks(updateTasksInput: UpdateTasksInput): Promise<{
        column: {
            id: string;
            title: string;
        };
        id: string;
        description: string;
        title: string;
        order: number;
    }[]>;
    removeTask(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        columnId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
