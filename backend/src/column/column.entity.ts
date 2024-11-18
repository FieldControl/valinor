import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnType,
  OneToMany,
} from 'typeorm';
import { Card } from '../card/card.entity';

@Entity('kanbancolumn')
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @ColumnType()
  name: string;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];
}
