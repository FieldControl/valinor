import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID, MaxLength, IsInt, Min, IsDateString } from 'class-validator';

@ObjectType()
export class CardDto {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID)
  column_id: string;

  @Field(() => Int)
  position: number;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  due_date?: string;

  @Field()
  created_at: string;

  @Field()
  updated_at: string;
}

@InputType()
export class CreateCardInputDto {
  @Field()
  @IsString()
  @MaxLength(255)
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @Field(() => ID)
  @IsUUID()
  column_id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(7) // For hex colors like #FF5733
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}

@InputType()
export class UpdateCardInputDto {
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
  @MaxLength(2000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  due_date?: string;
}

@InputType()
export class MoveCardInputDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => ID)
  @IsUUID()
  column_id: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  newPosition: number;
} 