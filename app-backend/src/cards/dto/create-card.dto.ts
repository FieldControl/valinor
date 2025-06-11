import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({ example: 'Comprar leite', description: 'Título do card' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada do card' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 0, description: 'Ordem dentro da coluna' })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({ example: 1, description: 'ID da coluna onde criar' })
  @IsInt()
  columnId: number;
}
