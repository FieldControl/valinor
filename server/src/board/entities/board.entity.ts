import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column } from 'src/column/entities/column.entity';

@ObjectType()
export class Board {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field()
  createdAt: Date;

  @Field(() => [Column], { nullable: true })
  columns?: Column[];
}
