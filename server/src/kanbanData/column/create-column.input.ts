import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {
  @Field()
  name: string;

  @Field()
  color: string;
}