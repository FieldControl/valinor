import { IsInt, IsNotEmpty, IsOptional, IsString, Min, IsISO8601 } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsString()
  columnId?: string;

  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}