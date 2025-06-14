import { Column as ColumnEntity } from "../../columns/entities/column.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    title: string;

    @Column()
    columnId: number;

    @ManyToOne(() => ColumnEntity, (column) => column.tasks)
    column: ColumnEntity;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}