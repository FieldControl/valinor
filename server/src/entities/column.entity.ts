import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { BoardEntity } from './board.entity';
import { CardEntity } from './card.entity';

@Entity('columns')
export class ColumnEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => BoardEntity, board => board.columns)
  board: BoardEntity;

  @OneToMany(() => CardEntity, card => card.column)
  cards: CardEntity[];
}
