import { CreateCardInput } from './create-card.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCardInput extends PartialType(CreateCardInput) {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  assignedUserId?: number;
}
