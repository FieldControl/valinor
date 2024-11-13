import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateBoardInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  id: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  updatedBy?: number;
}
