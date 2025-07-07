
import {
  Entity,
  PrimaryGeneratedColumn,
  Column as OrmColumn,
  ManyToOne,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column } from '../column/column.entity'; 

@ObjectType()
@Entity()
export class Card {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @OrmColumn()
  title: string;

  @Field({ nullable: true })
  @OrmColumn({ nullable: true })
  description?: string;

  
  @Field({ nullable: true })
  @OrmColumn({ nullable: true })
  order?: number;

  @Field(() => Column)
  @ManyToOne(() => Column, (column) => column.cards, { onDelete: 'CASCADE' })
  column: Column;
  card: Card;
}
