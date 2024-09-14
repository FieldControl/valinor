//Criando uma coluna SQL para anmazenas dados do usuario
import { Board } from "src/board/entities/board.entity";
import { Card } from "src/card/entities/card.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Columns {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    order: number;

    @Column()
    boardId: number;

    @ManyToOne(() => Board, (board) => board.columns)
    @JoinColumn()
    board: Board;

    @OneToMany(() => Card, (card) => card.columns)
    cards: Card[];
}
