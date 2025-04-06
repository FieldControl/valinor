import { InputType, Field, Int } from '@nestjs/graphql';

// Criando DTO para inserir cartões, o DTO serve para atrelar entidades do banco de dados com o GraphQL.
@InputType()
export class CreateCardInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  columnId: number;
}
