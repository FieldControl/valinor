import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateCardInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  columnId?: string;
}
