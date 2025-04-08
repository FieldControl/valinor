import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true})
  description?: string;

  @Field()
  columnId: string;
}
