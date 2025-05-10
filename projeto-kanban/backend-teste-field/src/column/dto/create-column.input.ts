import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateColumnKanbanInput {
  
  @Field()
  title: string;

  // @Field (() => Int)
  // position: number;

}
