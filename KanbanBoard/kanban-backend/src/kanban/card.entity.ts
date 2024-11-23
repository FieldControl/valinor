import { Entity, PrimaryGeneratedColumn, Column as DBColumn, ManyToOne } from 'typeorm';
import { Column } from './column.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @DBColumn()
  title: string;

  @DBColumn()
  description: string;

  @ManyToOne(() => Column, (column) => column.cards, { onDelete: 'CASCADE' })
  column: Column;
}