import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

import { UserEntity } from './user.entity';
import { ColumnEntity } from './column.entity';

@Entity('boards')
export class BoardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => UserEntity, user => user.boards)
  user: UserEntity;

  @OneToMany(() => ColumnEntity, column => column.board)
  columns: ColumnEntity[];
}
