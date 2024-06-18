import { Column } from './column.entity';
export declare class Task {
    id: string;
    title: string;
    description: string;
    column: Column;
    createdAt: Date;
    updatedAt: Date;
    order: number;
}
