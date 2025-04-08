import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {
  @Field()
  title: string;
}
