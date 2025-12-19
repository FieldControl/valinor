import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {
  @Field(() => String)
  name: string;
  
  @Field(() => Int)
  boardId: number;
}
