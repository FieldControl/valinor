import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnType,
  ManyToOne,
} from 'typeorm';
import { Column } from '../column/column.entity';

@Entity('card')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @ColumnType()
  title: string;

  @ColumnType({ nullable: true })
  description: string;

  @ManyToOne(() => Column, (column) => column.cards)
  column: Column;
}
