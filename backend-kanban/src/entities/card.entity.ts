import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { KanbanColumn } from './kanban-column.entity';

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
