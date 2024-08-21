import { PartialType } from '@nestjs/mapped-types';
import {CriarColunaDto } from './create-coluna.dto';

export class AtualizarColunaDto extends PartialType(CriarColunaDto) {}
