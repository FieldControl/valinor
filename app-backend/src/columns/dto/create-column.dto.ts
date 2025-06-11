import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ example: 'Todo', description: 'Título da coluna' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 0, description: 'Ordem da coluna' })
  @IsInt()
  @Min(0)
  order: number;
}
