import { CreateTaskInput } from './create-task.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateTaskInput extends PartialType(CreateTaskInput) {
  @Field(() => String)
  id: string;
}

@InputType()
export class UpdateTasksInput {
  @Field(() => [UpdateTaskInput])
  tasks: UpdateTaskInput[];
}
