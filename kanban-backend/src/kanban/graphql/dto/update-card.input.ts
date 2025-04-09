import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateCardInput } from './create-card.input';

@InputType()
export class UpdateCardInput extends PartialType(CreateCardInput) {
  @Field(() => ID)
  id: number;
}
