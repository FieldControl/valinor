import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(type => ID)
  id: number;

  @Field()
  title: string;
}