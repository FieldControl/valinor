import { Column as ColumnEntity } from "../../columns/entities/column.entity";
import { User } from "../../user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Board {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.boards)
    user: User;

    @OneToMany(() => ColumnEntity, (column) => column.board, { cascade: true })
    columns: ColumnEntity[];

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;
}