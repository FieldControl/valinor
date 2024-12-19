import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class TaskType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  status: string;

}