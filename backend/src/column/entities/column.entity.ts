import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';
import {
  Column as ColumnORM,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @ColumnORM({ length: 100 })
  name: string;

  @ColumnORM()
  order: number;

  @ColumnORM()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.columns)
  @JoinColumn()
  board: Board;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];
}
