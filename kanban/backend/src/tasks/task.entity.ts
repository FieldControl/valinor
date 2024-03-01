import { Entity, Column as TypeORMColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Column } from '../columns/column.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeORMColumn()
  name: string;

  @ManyToOne(() => Column, column => column.tasks)
  column: Column;
}
