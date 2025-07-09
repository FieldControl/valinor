import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

@ObjectType()
export class BoardDto {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  created_at: string;

  @Field()
  updated_at: string;
}

@InputType()
export class CreateBoardInputDto {
  @Field()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

@InputType()
export class UpdateBoardInputDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
} 