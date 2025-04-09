import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCardInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  columnId: number;
}
