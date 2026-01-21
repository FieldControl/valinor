import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { Column as DbColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from './board.entity';
import { Task } from './task.entity';

@ObjectType()
@Entity()
export class KanbanColumn {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @DbColumn()
  name: string;

  @Field(() => Int)
  @DbColumn({ default: 0 })
  order: number;

  @Field(() => Board)
  @ManyToOne(() => Board, (b) => b.columns, { onDelete: 'CASCADE' })
  board: Board;

  @Field(() => [Task], { nullable: true })
  @OneToMany(() => Task, (t) => t.column, { cascade: true })
  tasks?: Task[];
}
