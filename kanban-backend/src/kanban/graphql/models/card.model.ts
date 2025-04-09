import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CardModel {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  columnId: number;
}
