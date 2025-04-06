import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreateCardInput } from './create-card.input';

// Criando DTO para atualizar cartões, o DTO serve para atrelar entidades do banco de dados com o GraphQL.
@InputType()
export class UpdateCardInput extends PartialType(CreateCardInput) {
  @Field(() => ID)
  id: number;
}
