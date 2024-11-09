import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { KanbanColumn } from '../column/column.entity';  

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => KanbanColumn, (column) => column.cards)
  column: KanbanColumn;  
}
