import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { BoardEntity } from './board.entity';
import { CardEntity } from './card.entity';

@Entity('columns')
export class ColumnEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  board_id: number;

  @Column({ type: 'int', nullable: false })
  position: number;

  @Column({ nullable: false})
  title: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  creation_date: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  change_date: Date;

  @ManyToOne(() => BoardEntity, board => board.columns)
  board: BoardEntity;

  @OneToMany(() => CardEntity, card => card.column)
  cards: CardEntity[];
}
