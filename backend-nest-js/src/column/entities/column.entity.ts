//Criando uma coluna SQL para anmazenas dados do usuario
import { Board } from "src/board/entities/board.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


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

    @ManyToOne(() => Board, (board) =>board.Columnss)
    @JoinColumn()
    boards: Board;
}
