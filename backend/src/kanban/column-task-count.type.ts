import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ColumnTaskCount {
  @Field()
  columnName: string;

  @Field(() => Int)
  count: number;
}