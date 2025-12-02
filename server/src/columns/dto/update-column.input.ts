import { CreateColumnInput } from './create-column.input.js';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateColumnInput extends PartialType(CreateColumnInput) {
  @Field(() => Int, { description: 'Column Id' })
  id: number;
}
