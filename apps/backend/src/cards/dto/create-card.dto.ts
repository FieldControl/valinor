import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsHexColor,
  IsEnum,
  IsNumber,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @IsNumber()
  @IsNotEmpty()
  columnId: number;
}
