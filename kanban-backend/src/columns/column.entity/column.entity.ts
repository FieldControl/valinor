import { Entity, PrimaryGeneratedColumn, Column as ColumnDecorator, OneToMany } from 'typeorm';
import { Card } from '../../cards/card.entity/card.entity';

@Entity()
export class KanbanColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @ColumnDecorator()
  title: string;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];
}
