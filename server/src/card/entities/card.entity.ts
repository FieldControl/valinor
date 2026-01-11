import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => Int, { description: 'Card Id' })
  id: number;

  @Field(() => String, { description: 'Card description', nullable: true })
  desc?: string;

  @Field(() => String, { description: 'Card title' })
  title: string;

  @Field(() => Int, { description: 'Column Id' })
  columnId: number;

  @Field(() => Boolean, { description: 'Is archived?' })
  isArchived: boolean;
}
