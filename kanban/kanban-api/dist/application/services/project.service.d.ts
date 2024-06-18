import { CreateProjectInput } from '../dto/projectDto/create-project.input';
import { UpdateProjectInput } from '../dto/projectDto/update-project.input';
import { PrismaService } from '@infra/data/client/prisma.service';
export declare class ProjectService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createProjectInput: CreateProjectInput): Promise<{
        columns: ({
            tasks: {
                id: string;
                title: string;
                description: string;
                columnId: string;
                order: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            title: string;
            description: string;
            projectId: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
        users: {
            id: string;
            name: string;
            email: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        columns: ({
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
        })[];
        users: {
            id: string;
            name: string;
            email: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        columns: ({
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
        })[];
        users: {
            id: string;
            name: string;
            email: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateProjectInput: UpdateProjectInput): Promise<{
        columns: ({
            tasks: {
                id: string;
                title: string;
                description: string;
                columnId: string;
                order: number;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            id: string;
            title: string;
            description: string;
            projectId: string;
            order: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
        users: {
            id: string;
            name: string;
            email: string;
            password: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
