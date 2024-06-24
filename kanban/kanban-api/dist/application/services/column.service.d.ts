import { CreateColumnInput } from '@application/dto/columnDto/create-column.input';
import { UpdateColumnInput, UpdateColumnsInput } from '@application/dto/columnDto/update-column.input';
import { PrismaService } from '@infra/data/client/prisma.service';
export declare class ColumnService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createColumnInput: CreateColumnInput): Promise<{
        project: {
            id: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        };
        tasks: ({
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
        })[];
    } & {
        id: string;
        title: string;
        description: string;
        projectId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        project: {
            id: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        };
        tasks: ({
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
        })[];
    } & {
        id: string;
        title: string;
        description: string;
        projectId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        project: {
            id: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        };
        tasks: ({
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
        })[];
    } & {
        id: string;
        title: string;
        description: string;
        projectId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateColumnInput: UpdateColumnInput): Promise<{
        project: {
            id: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        };
        tasks: ({
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
        })[];
    } & {
        id: string;
        title: string;
        description: string;
        projectId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMany(updateColumnsInput: UpdateColumnsInput): Promise<{
        id: string;
        description: string;
        title: string;
        order: number;
        tasks: {
            column: {
                id: string;
                title: string;
            };
            id: string;
            title: string;
        }[];
    }[]>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        projectId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
