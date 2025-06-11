import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    description:
      'Tipo de permissão (0=admin, 1=criador, 2=visualizar, 3=nenhuma)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Max(3)
  tipo: number;
}
