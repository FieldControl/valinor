import { IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  columnId?: number;
}