import {
  Entity,
  PrimaryGeneratedColumn,
  Column as DBColumn,
  ManyToOne,
} from 'typeorm';
import { Column } from '../columns/columns.entity';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Card {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @DBColumn()
  content: string;

  @Field()
  @DBColumn()
  order: number;

  @Field(() => Column)
  @ManyToOne(() => Column, (column) => column.cards)
  column: Column;
}
