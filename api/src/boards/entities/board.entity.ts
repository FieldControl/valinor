import { Column } from "src/columns/entities/column.entity";
import { User } from "src/user/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Board {
    @PrimaryGeneratedColumn()
    id: number;
    title: string;
    userId: number;
    @ManyToOne(() => User, (user) => user.boards)
    user: User;
    @OneToMany(() => Column, (column) => column.board, { cascade: true })
    columns: Column[];
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}