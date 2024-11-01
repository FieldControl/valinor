import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column } from './column.entity';

@ObjectType()
export class Task {
  @Field(() => String)
  id: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  title: string;

  @Field(() => String, { description: 'Example field (placeholder)' })
  description: string;

  @Field(() => Column, { nullable: true })
  column: Column;

  @Field(() => Date, { description: 'Creation date of the project' })
  createdAt: Date;

  @Field(() => Date, { description: 'Last update date of the project' })
  updatedAt: Date;

  @Field(() => Int, { description: 'Order of the column' })
  order: number;
}
