import { Field, Int, ObjectType } from '@nestjs/graphql';

// Criando model para card, o model serve para atrelar entidades do banco de dados com o GraphQL
@ObjectType()
export class CardModel {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  columnId: number;
}
