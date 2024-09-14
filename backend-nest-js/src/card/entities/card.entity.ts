//Criando uma coluna SQL para anmazenas dados do usuario
import { Columns } from "src/column/entities/column.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    content: string;


    @Column()
    order : number;

    @Column()
    columnId : number;

    @ManyToOne(() => User, (user) => user.card)
    @JoinColumn()
    delegate: string;

    @ManyToOne(() => Columns, (columns) => columns.cards, { onDelete: 'CASCADE' })
    columns: Columns;
}
