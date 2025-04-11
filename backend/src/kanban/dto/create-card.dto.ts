import { IsString, IsNotEmpty, IsDateString, Length } from 'class-validator';

export class CreateCardDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  nome: string;

  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  @IsString({ message: 'A descrição deve ser uma string.' })
  @Length(5, 255, { message: 'A descrição deve ter entre 5 e 255 caracteres.' })
  descricao: string;

  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  @IsString({ message: 'A categoria deve ser uma string.' })
  categoria: string;

  @IsNotEmpty({ message: 'A data é obrigatória.' })
  @IsDateString({}, { message: 'A data deve estar em formato ISO (ex: 2025-04-09).' })
  data: string;

  @IsNotEmpty({ message: 'O status é obrigatório.' })
  @IsString({ message: 'O status deve ser uma string.' })
  status: 'Pendente' | 'Fazendo' | 'Finalizado';
}
