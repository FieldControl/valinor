import { Exclude } from "class-transformer";
import { Board } from "../../boards/entities/board.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({length:50})
    @Unique(['username'])
    username: string;
    @Column({length:100})
    @Exclude()
    password: string;
    @OneToMany(() => Board, (board) => board.user)
    boards: Board[];
    @Column({default: 1})
    status: number;
}
