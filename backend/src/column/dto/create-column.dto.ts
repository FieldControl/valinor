import { IsNotEmpty, IsString } from 'class-validator';

export class CreateColumnDto {
  @IsString({ message: 'O nome da coluna deve ser uma string' })
  @IsNotEmpty({ message: 'O nome da coluna não pode ser vazio' })
  name: string;
}
