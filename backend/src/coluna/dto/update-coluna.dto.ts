import { PartialType } from '@nestjs/mapped-types';
import { CreateColunaDto } from './create-coluna.dto';

export class UpdateColunaDto extends PartialType(CreateColunaDto) {}
