import { Column } from "src/columns/entities/column.entity";
import { BeforeInsert, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;
    title: string;
    description: string;
    status: string; // "todo", "in-progress", "done"
    position: number;
    columnId: number;
    @ManyToOne(() => Column, (column) => column.tasks)
    column: Column;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}