import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCardInput {
  @Field()
  title?: string;

  @Field()
  description?: string;

  @Field()
  position?: number;

  @Field()
  columnId?: number;
}
