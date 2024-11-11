import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateColumnInput {
  @Field(() => Int, { nullable: true })
  @IsString()
  @IsOptional()
  id?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  position?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  boardId?: number;
}
