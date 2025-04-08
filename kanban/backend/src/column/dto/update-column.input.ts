import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateColumnInput {
  @Field()
  title: string;
}
