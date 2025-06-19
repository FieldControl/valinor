import { IsInt, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  content: string;

  @IsInt()
  columnId: number;
}