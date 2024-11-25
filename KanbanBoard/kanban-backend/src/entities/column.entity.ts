import { Entity, PrimaryGeneratedColumn, Column as DBColumn, OneToMany } from 'typeorm';
import { Card } from './card.entity';

@Entity()
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @DBColumn()
  title: string;

  @OneToMany(() => Card, (card) => card.column, { cascade: true })
  cards: Card[];
}