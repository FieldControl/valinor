import { IsString, MinLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;
}
