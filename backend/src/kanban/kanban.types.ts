import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;
}

@ObjectType()
export class Column {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => [Card])
  cards!: Card[];
}

@InputType()
export class CreateCardInput {
  @Field(() => ID)
  columnId!: string;

  @Field()
  title!: string;
}

@InputType()
export class MoveCardInput {
  @Field(() => ID)
  cardId!: string;

  @Field(() => ID)
  toColumnId!: string;

  @Field(() => Int, { nullable: true })
  newIndex?: number;
}
