import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
