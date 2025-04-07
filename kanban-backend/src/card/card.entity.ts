import { Entity, PrimaryGeneratedColumn, Column as DBColumn, ManyToOne } from 'typeorm';
import { BoardColumn } from '../board/board.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @DBColumn()
  title: string;

  @DBColumn()
  description: string;

  @ManyToOne(() => BoardColumn, (column) => column.cards)
  column: BoardColumn;
}
