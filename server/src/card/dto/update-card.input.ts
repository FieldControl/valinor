import { CreateCardInput } from './create-card.input.js';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCardInput extends PartialType(CreateCardInput) {
  @Field(() => Int, { description: 'Card Id' })
  id: number;
}
