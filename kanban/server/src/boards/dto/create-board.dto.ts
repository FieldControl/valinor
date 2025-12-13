import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {

  @IsString()
  @IsNotEmpty()
  name: string;
}