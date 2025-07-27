import { CreateTaskInput } from './create-task.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => Int)
  id: number;
  
  @Field(() => String)
  name: string;

  @Field(() => String)
  desc: string;

  @Field(() => Int)
  step: number;
}
