import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BoardUser {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;
}
