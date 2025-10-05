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
import {
  CreateCardDto as SharedCreateCardDto,
  Priority,
} from '@test/shared-types';

export class CreateCardDto implements SharedCreateCardDto {
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
  priority?: Priority;

  @IsNumber()
  @IsNotEmpty()
  columnId: number;
}
