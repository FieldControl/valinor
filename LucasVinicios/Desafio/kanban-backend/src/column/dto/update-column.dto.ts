import { PartialType } from '@nestjs/mapped-types';
import { CreateColumnDto } from './create-column.dto';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  boardId?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}
