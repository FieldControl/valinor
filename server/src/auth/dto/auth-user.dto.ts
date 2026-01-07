import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;
}
