import { IsString } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  title: string;
}