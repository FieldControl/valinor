import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column } from '../column/column.entity';

@ObjectType()
export class Card {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  position?: number;

  @Field({ nullable: true })
  createdAt: Date;

  @Field({ nullable: true })
  createdBy: number;

  @Field({ nullable: true })
  updatedAt: Date;

  @Field({ nullable: true })
  updatedBy: number;

  @Field(() => Column, { nullable: true })
  column?: Column;

  @Field(() => Int, { nullable: true })
  columnId?: number;
}
