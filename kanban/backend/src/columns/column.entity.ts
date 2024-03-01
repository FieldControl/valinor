import { Entity, Column as TypeORMColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Board } from '../boards/board.entity';
import { Task } from '../tasks/task.entity';

@Entity()
export class Column {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeORMColumn()
  name: string;

  @ManyToOne(() => Board, board => board.columns)
  board: Board;

  @OneToMany(() => Task, task => task.column, { cascade: true, eager: true })
  tasks: Task[];
}
