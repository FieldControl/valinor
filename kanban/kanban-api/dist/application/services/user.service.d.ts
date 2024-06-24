import { CreateUserInput } from '@application/dto/userDto/create-user.input';
import { UpdateUserInput } from '@application/dto/userDto/update-user.input';
import { PrismaService } from '@infra/data/client/prisma.service';
export declare class UserService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    create(createUserInput: CreateUserInput): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        projects: ({
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
        } & {
            id: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        projects: ({
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
        } & {
            id: string;
            title: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    } & {
        id: string;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserInput: UpdateUserInput): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
