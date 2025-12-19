import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCardInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  columnId: number;
}
