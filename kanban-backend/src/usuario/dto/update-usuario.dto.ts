import { PartialType } from '@nestjs/mapped-types';
import { CriarUsuarioDto } from './create-usuario.dto';

export class AtualizarUsuarioDto extends PartialType(CriarUsuarioDto) {}
