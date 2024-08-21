import { PartialType } from '@nestjs/mapped-types';
import { CriarQuadroDto } from './create-quadro.dto';

export class AtualizarQuadroDto extends PartialType(CriarQuadroDto) {}
