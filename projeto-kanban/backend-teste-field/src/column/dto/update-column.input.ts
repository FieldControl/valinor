import { CreateColumnKanbanInput } from './create-column.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateColumnKanbanInput extends PartialType(CreateColumnKanbanInput) {
  @Field(() => Int)
  id: number;
}
