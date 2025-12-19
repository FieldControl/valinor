import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  columnId: number;

  @Field(() => Int, { nullable: true })
  assignedUserId?: number;

  @Field(() => String, { nullable: true })
  assignedUserName?: string;

  @Field()
  createdAt: Date;
}
