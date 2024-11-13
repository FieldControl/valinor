import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateBoardInput {
  @Field()
  name: string;

  @Field(() => Int)
  userId: number;

  @Field(() => Int, { nullable: true })
  createdBy?: number;
}
