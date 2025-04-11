import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddCardDto {
  @IsNumber()
  columnId: number;

  @IsString()
  @IsNotEmpty()
  item: string;
}
