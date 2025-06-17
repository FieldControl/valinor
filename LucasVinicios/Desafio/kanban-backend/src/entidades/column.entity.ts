import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Board } from './board.entity'; 
import { Card } from './card.entity'; 

@Entity('columns') 
export class ColumnEntity {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  order: number; 

  @ManyToOne(() => Board, board => board.columns, { onDelete: 'CASCADE' })
  board: Board;

  @OneToMany(() => Card, card => card.column, { cascade: true })
  cards: Card[]; 
}
