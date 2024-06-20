import { IsString, IsNotEmpty } from 'class-validator';

export class ColumnsDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}
