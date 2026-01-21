import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCandidatoInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
