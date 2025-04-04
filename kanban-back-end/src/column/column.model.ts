import { Field, ObjectType } from '@nestjs/graphql';
import { Card } from '../card/card.model';

@ObjectType()
export class Column {
  @Field() //Campo exposto via GraphQL
  id: string;

  @Field()
  title: string;

  @Field(() => [Card], { nullable: true }) //Array de cards associado à coluna
  cards?: Card[];
}
