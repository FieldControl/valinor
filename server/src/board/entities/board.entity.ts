import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column } from '../../columns/entities/column.entity.js';

@ObjectType()
export class Board {
  @Field(() => Int, { description: 'Board Id' })
  id: number;

  @Field(() => String, { description: 'Board Title' })
  title: string;

  @Field(() => Boolean, { description: 'Is archived?' })
  isArchived: boolean;

  @Field(() => [Column], {
    description: 'Board columns',
    nullable: 'itemsAndList',
  })
  columns?: Column[];
}
