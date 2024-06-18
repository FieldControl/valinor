import { CreateColumnInput } from './create-column.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateColumnInput extends PartialType(CreateColumnInput) {
  @Field(() => String)
  id: string;
}

@InputType()
export class UpdateColumnsInput {
  @Field(() => [UpdateColumnInput])
  columns: UpdateColumnInput[];
}
