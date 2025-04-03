import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateColumnDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  position: number;
}




