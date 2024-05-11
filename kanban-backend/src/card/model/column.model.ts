// column.model.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Card } from './card.model';

@ObjectType()
export class Column {
  @Field(type => ID)
  id: number;

  @Field()
  title: string;

  @Field(type => [Card])
  cards: Card[]; 
}
