import { IsNotEmpty, IsString } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  boardId: string;
}
import { IsOptional, IsString } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  title?: string;
}