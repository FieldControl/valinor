import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field() //Identificador único do card
  id: string;

  @Field() //Título visível do card
  title: string;

  @Field() //Descrição do conteúdo do card
  description: string;
}
