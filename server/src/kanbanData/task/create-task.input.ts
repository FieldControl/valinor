import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTaskInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  status: string;  // Status será o nome da coluna
}