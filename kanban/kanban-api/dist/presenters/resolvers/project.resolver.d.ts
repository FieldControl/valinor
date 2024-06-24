import { ProjectService } from '../../application/services/project.service';
import { CreateProjectInput } from '../../application/dto/projectDto/create-project.input';
import { UpdateProjectInput } from '../../application/dto/projectDto/update-project.input';
export declare class ProjectResolver {
    private readonly projectService;
    constructor(projectService: ProjectService);
    createProject(createProjectInput: CreateProjectInput): Promise<{
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
    updateProject(updateProjectInput: UpdateProjectInput): Promise<{
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
    removeProject(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
