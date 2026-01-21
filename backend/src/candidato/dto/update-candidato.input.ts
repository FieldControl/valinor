import { CreateCandidatoInput } from './create-candidato.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCandidatoInput extends PartialType(CreateCandidatoInput) {
  @Field(() => Int)
  id: number;
}
