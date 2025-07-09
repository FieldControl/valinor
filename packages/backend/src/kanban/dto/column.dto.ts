import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID, MaxLength, IsInt, Min } from 'class-validator';

@ObjectType()
export class ColumnDto {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => ID)
  board_id: string;

  @Field(() => Int)
  position: number;

  @Field()
  created_at: string;

  @Field()
  updated_at: string;
}

@InputType()
export class CreateColumnInputDto {
  @Field()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field(() => ID)
  @IsUUID()
  board_id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

@InputType()
export class UpdateColumnInputDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

@InputType()
export class MoveColumnInputDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  newPosition: number;
} 