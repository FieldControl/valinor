import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Column } from "typeorm";
import { Board } from "src/boards/entities/board.entity";
import { Card } from "src/cards/entities/card.entity";





@Entity()
export class ColumnEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => Board, (board) => board.columns)
    board: Board;
    
    
    @OneToMany(() => Card, (card) => card.column)
    cards: Card[];
}
