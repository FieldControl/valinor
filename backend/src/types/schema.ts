import { Field, ObjectType, ID, InputType } from 'type-graphql';
import { DateTimeScalar } from './scalars';

@ObjectType()
export class Tag {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  color: string;
}

@InputType()
export class TagInput {
  @Field()
  name: string;

  @Field()
  color: string;
}

@ObjectType()
export class Attachment {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field()
  type: string;
}

@InputType()
export class AttachmentInput {
  @Field()
  name: string;

  @Field()
  url: string;

  @Field()
  type: string;
}

@ObjectType()
export class Card {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  @Field(() => DateTimeScalar, { nullable: true })
  dueDate?: Date;

  @Field(() => [Attachment], { nullable: true })
  attachments?: Attachment[];

  @Field()
  order: number;
}

@InputType()
export class CardInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [TagInput], { nullable: true })
  tags?: TagInput[];

  @Field(() => DateTimeScalar, { nullable: true })
  dueDate?: Date;

  @Field(() => [AttachmentInput], { nullable: true })
  attachments?: AttachmentInput[];

  @Field({ defaultValue: 0 })
  order: number;
}

@ObjectType()
export class Column {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => [Card])
  cards: Card[];

  @Field({ nullable: true })
  cardLimit?: number;

  @Field({ nullable: true })
  color?: string;
}

@InputType()
export class ColumnInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  cardLimit?: number;

  @Field({ nullable: true })
  color?: string;
}

@InputType()
export class ColumnUpdateInput {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  cardLimit?: number;

  @Field({ nullable: true })
  color?: string;
  
  @Field(() => [CardInput], { nullable: true })
  cards?: CardInput[];
}

@ObjectType()
export class Board {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => [Column])
  columns: Column[];
  
  @Field({ nullable: true })
  userId?: string;
  
  @Field(() => DateTimeScalar, { nullable: true })
  createdAt?: Date;
}

@InputType()
export class BoardInput {
  @Field()
  title: string;
} 