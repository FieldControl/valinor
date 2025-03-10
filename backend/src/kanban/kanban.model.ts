import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Column {
  @Field(type => Int)
  id: number;

  @Field()
  title: string;

  @Field(type => [Card])
  cards: Card[];
}

@ObjectType()
export class Card {
  @Field(type => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(type => Int)
  columnId: number;

  @Field(type => Column, { nullable: true })
  column?: Column;
}
