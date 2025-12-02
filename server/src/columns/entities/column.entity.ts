import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Card } from '../../card/entities/card.entity.js';

@ObjectType()
export class Column {
  @Field(() => Int, { description: 'Column Id' })
  id: number;

  @Field(() => String, { description: 'Column title' })
  title: string;

  @Field(() => Int, { description: 'Board Id' })
  boardId: number;

  @Field(() => Boolean, { description: 'Is archived?' })
  isArchived: boolean;

  @Field(() => [Card], {
    description: 'Column cards',
    nullable: 'itemsAndList',
  })
  cards?: Card;
}
