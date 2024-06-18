import { Project } from './project.entity';
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    projects: Project[];
    createdAt: Date;
    updatedAt: Date;
}
