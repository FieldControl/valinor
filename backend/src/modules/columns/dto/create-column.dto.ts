import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateColumnDto {

  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
