import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class MoveTaskInput {
  @Field(() => ID)
  taskId: string;

  @Field(() => ID)
  toColumnId: string;

  @Field(() => Int, { defaultValue: 0 })
  newOrder: number;
}
