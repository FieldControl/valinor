import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { KanbanColumn } from '../../columns/column.entity/column.entity';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => KanbanColumn, (column) => column.cards, { onDelete: 'CASCADE' })
  column: KanbanColumn;
}
