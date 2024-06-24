import { CreateTaskInput } from '@application/dto/taskDto/create-task.input';
import { UpdateTaskInput, UpdateTasksInput } from '@application/dto/taskDto/update-task.input';
import { PrismaService } from '@infra/data/client/prisma.service';
export declare class TaskService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createTaskInput: CreateTaskInput): Promise<{
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
    update(id: string, updateTaskInput: UpdateTaskInput): Promise<{
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
    updateMany(updateTasksInput: UpdateTasksInput): Promise<{
        column: {
            id: string;
            title: string;
        };
        id: string;
        description: string;
        title: string;
        order: number;
    }[]>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        columnId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
