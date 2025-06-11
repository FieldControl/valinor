import { IsInt, Min, Max } from 'class-validator';

export class UpdateUserRoleDto {
  @IsInt()
  @Min(0)
  @Max(3)
  tipo: number; // 0=admin, 1=criador, 2=leitor, 3=sem cargo
}
