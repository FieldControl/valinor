import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusTarefa } from '../task.status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Comprar pão', description: 'Título da tarefa' })
  @IsString()
  titulo: string;

  @ApiProperty({ example: 'Ir à padaria às 8h', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 0, description: 'Status: 0 - Pendente, 1 - Em Andamento, 2 - Concluída' })
  @IsEnum(StatusTarefa)
  status: StatusTarefa;
}
