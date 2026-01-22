import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {
  @Field(() => ID)
  boardId: string;

  @Field()
  name: string;

  @Field(() => Int, { defaultValue: 0 })
  order: number;
}
