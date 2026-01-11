import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {
  @Field(() => Int, { description: 'Board Id' })
  boardId: number;

  @Field(() => String, { description: 'Column title' })
  title: string;
}
