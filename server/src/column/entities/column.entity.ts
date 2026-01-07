import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Card } from 'src/card/entities/card.entity';

@ObjectType()
export class Column {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  boardId: number;

  @Field(() => Int)
  position: number;

  @Field(() => [Card], { nullable: true })
  cards?: Card[];
}
