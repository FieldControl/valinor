import { PartialType } from '@nestjs/mapped-types';
import { CreateQuadroDto } from './create-quadro.dto';

export class UpdateQuadroDto extends PartialType(CreateQuadroDto) {}
