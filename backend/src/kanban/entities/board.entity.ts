import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { KanbanColumn as KanbanColumn } from './column.entity';

@ObjectType()
@Entity()
export class Board {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => [KanbanColumn], { nullable: true })
  @OneToMany(() => KanbanColumn, (col) => col.board, { cascade: true })
  columns?: KanbanColumn[];
}
