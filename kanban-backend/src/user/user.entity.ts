import { ObjectType, Field, Int, HideField } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  createdAt: Date;

  @Field(() => Int)
  createdBy: number;

  @Field()
  lastLoginAt?: Date;

  @Field()
  email: string;

  @Field()
  name: string;

  @HideField()
  password: string;
}
