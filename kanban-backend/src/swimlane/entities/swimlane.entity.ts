import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Board } from '../../board/entities/board.entity';
import { Card } from '../../card/entities/card.entity';

@Entity()
export class Swimlane {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  order: number;

  @Column()
  boardId: number;

  @ManyToOne(() => Board, board => board.swimlanes, { onDelete: 'CASCADE' })
  @JoinColumn()
  board: Board;

  @OneToMany(() => Card, card => card.swimlane)
  cards: Card[];
}
