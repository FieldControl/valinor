import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { KanbanColumn } from '../column/column.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => KanbanColumn, (column) => column.tasks)
  column: KanbanColumn;
}
