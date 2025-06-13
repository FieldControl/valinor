import { Board } from "../../boards/entities/board.entity";
import { Task } from "../../tasks/entities/task.entity";
import { BeforeInsert, CreateDateColumn, Column as TypeORMColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Column {
    @PrimaryGeneratedColumn()
    id: number;

    @TypeORMColumn()
    title: string;

    @TypeORMColumn()
    position: number;

    @TypeORMColumn()
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