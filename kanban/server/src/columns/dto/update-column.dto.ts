import { IsInt, IsString, Min, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
