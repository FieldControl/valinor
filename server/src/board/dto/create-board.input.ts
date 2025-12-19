import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBoardInput {
  @Field(() => String)
  name: string;
}
