import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ReorderCardDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  position: number;

  @IsNumber()
  @IsOptional()
  columnId?: number;
}
