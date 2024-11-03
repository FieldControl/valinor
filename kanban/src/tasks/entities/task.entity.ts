import { Lane } from "../../lanes/entities/lane.entity";
import { Column, ManyToOne, PrimaryGeneratedColumn, Entity } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({length: 50 })
    title: string;
    @Column({length: 500})
    description: string;
    @Column()
    targetDate: Date;
    @ManyToOne(() => Lane, (lane) => lane.tasks,{ })
    lane: Lane;
    @Column()
    taskStatus:number; // 1: todo, 2: in progress, 3: done
    @Column({default: 1})
    status: number; // 1: active, 0: inactive
    @Column()
    laneId: number;

}
