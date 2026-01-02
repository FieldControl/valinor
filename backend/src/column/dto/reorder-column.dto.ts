import { IsNumber } from 'class-validator';

export class ReorderColumnDto {
  @IsNumber()
  id: number;

  @IsNumber()
  position: number;
}
