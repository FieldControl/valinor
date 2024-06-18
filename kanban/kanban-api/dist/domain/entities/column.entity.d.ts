import { Task } from './task.entity';
import { Project } from './project.entity';
export declare class Column {
    id: string;
    title: string;
    description: string;
    project: Project;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
    order: number;
}
