import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateBoardInput } from './create-board.input.js';

@InputType()
export class UpdateBoardInput extends PartialType(CreateBoardInput) {
  @Field(() => Int, { description: 'Board Id' })
  id: number;
}
