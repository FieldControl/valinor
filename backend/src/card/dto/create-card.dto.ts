import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do card não pode ser vazio.' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  columnId: number;
}
