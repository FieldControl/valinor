import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Swimlane {
  @PrimaryGeneratedColumn()
  idSwimlane: number;

  @Column({ length: 100 })
  nameSwimlane: string;

  @Column()
  order: number;
  //pistas conectadas
  @Column()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.swimlanes)
  @JoinColumn()
  board: Board;

  @OneToMany(() => Card, (card) => card.swimlane)
  cards: Card[];
}
