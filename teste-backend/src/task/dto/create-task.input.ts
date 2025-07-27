import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateTaskInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  desc: string;

  @Field(() => Int)
  step: number;
}