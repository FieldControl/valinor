import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Lane } from "../../lanes/entities/lane.entity";
import { User } from "../../users/entities/user.entity";
@Entity()
export class Board {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({length:50})
    name: string;
    @OneToMany(() => Lane, (lane) => lane.board)
    lanes: Lane[];
    @ManyToOne(() => User, (user) => user.boards)
    user: User;
    @Column({default:1})
    status: number;
    @Column()
    userId: number;
    
}
