import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class AddUserToBoardInput {
  @Field(() => Int)
  boardId: number;

  @Field(() => String)
  email: string;
}
