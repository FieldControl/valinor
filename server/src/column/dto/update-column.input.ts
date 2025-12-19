import { CreateColumnInput } from './create-column.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateColumnInput extends PartialType(CreateColumnInput) {
  @Field(() => Int)
  id: number;
}
