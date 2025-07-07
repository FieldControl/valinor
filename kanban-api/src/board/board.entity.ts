
import {
  Entity,
  PrimaryGeneratedColumn,
  Column as OrmColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column } from '../column/column.entity'; 

@ObjectType()
@Entity()
export class Board {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @OrmColumn()
  name: string;

  @Field(() => [Column], { nullable: true })
  @OneToMany(() => Column, (column) => column.board, {
    cascade: true,
    eager: true,
  })
  columns: Column[];
}
