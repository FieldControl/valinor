import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ColumnType {
  @Field(() => ID)
  id: string;

  @Field()
  color: string;


  @Field()
  name: string;

}