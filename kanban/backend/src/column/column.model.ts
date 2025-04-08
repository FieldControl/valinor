import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Card } from '../card/card.model';

@ObjectType()
export class Column {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => [Card], { defaultValue: [] })
  cards: Card[];
}
