import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Candidato {
  @Field()
  id: string;

  @Field()
  nome: string;

  @Field()
  email: string;

  @Field()
  coluna: string;
}