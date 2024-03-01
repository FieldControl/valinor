import { Entity, Column as TypeORMColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Column } from '../columns/column.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @TypeORMColumn()
  name: string;

  @OneToMany(() => Column, column => column.board, { cascade: true, eager: true })
  columns: Column[];
}
