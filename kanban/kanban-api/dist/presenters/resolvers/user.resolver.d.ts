import { CreateUserInput } from '@application/dto/userDto/create-user.input';
import { UpdateUserInput } from '@application/dto/userDto/update-user.input';
import { UserService } from '@application/services/user.service';
export declare class UserResolver {
    private readonly userService;
    constructor(userService: UserService);
    createUser(createUserInput: CreateUserInput): Promise<{
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
    updateUser(updateUserInput: UpdateUserInput): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeUser(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
