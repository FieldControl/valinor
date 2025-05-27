import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTaskColumnDto {
  @IsString()
  @IsNotEmpty()
  columnId: string;
}