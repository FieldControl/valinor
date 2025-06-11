import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsInt()
  columnId: number;
}
