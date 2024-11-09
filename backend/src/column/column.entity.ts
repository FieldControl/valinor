import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Card } from '../card/card.entity';

@Entity()
export class KanbanColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];
}
