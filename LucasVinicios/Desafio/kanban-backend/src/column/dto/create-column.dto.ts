import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateColumnDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  boardId: number;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}
