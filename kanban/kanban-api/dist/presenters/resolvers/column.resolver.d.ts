import { CreateColumnInput } from '../../application/dto/columnDto/create-column.input';
import { UpdateColumnInput, UpdateColumnsInput } from '../../application/dto/columnDto/update-column.input';
import { ColumnService } from '@application/services/column.service';
export declare class ColumnResolver {
    private readonly columnService;
    constructor(columnService: ColumnService);
    createColumn(createColumnInput: CreateColumnInput): Promise<{
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
    updateColumn(updateColumnInput: UpdateColumnInput): Promise<{
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
    updateColumns(updateColumnsInput: UpdateColumnsInput): Promise<{
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
    removeColumn(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        projectId: string;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
