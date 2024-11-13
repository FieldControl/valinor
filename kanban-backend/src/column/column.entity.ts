import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Board } from '../board/board.entity';

@ObjectType()
export class Column {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  position?: number;

  @Field({ nullable: true })
  createdAt: Date;

  @Field({ nullable: true })
  createdBy: number;

  @Field({ nullable: true })
  updatedAt: Date;

  @Field({ nullable: true })
  updatedBy: number;

  @Field(() => Board, { nullable: true })
  board?: Board;

  @Field(() => Int, { nullable: true })
  boardId?: number;
}
