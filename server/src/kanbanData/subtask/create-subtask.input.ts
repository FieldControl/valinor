import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateSubtaskInput {
  @Field()
  name: string;  // Título da subtask

  @Field()
  task: string;  // ID da task principal que a subtask pertence
}
