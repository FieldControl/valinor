
import { Board } from "../../boards/entities/board.entity";
import { Task } from "../../tasks/entities/task.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Lane {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({length:50})
    name: string;
    @Column()
    order: number;
    @OneToMany(() => Task, (task) => task.lane)
    tasks: Task[];
    @ManyToOne(() => Board, (board) => board.lanes)
    board: Board;
    @Column({default:1})
    status: number;
    @Column()
    boardId: number;
    
}
