import { User } from './user.entity';
import { Column } from './column.entity';
export declare class Project {
    id: string;
    title: string;
    description: string;
    columns: Column[];
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}
