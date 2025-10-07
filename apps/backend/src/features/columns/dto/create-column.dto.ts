import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsHexColor,
} from 'class-validator';
import { CreateColumnDto as SharedCreateColumnDto } from '@test/shared-types';

export class CreateColumnDto implements SharedCreateColumnDto {
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
}
