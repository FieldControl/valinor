import { Board } from "src/boards/entities/board.entity";
import { Task } from "src/tasks/entities/task.entity";
import { BeforeInsert, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Column {
    @PrimaryGeneratedColumn()
    id: number;
    title: string;
    position: number;
    boardId: number;
    @ManyToOne(() => Board, (board) => board.columns)
    board: Board;
    @OneToMany(() => Task, (task) => task.column, { cascade: true })
    tasks: Task[];
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}