import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCardInput {
  @Field(() => String, { description: 'Card description', nullable: true })
  desc?: string;

  @Field(() => String, { description: 'Card title' })
  title: string;

  @Field(() => Int, { description: 'Column id' })
  columnId: number;
}
