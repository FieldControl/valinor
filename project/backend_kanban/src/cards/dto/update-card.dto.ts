import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

/**
 * DTO para atualização de Card. Usa PartialType para tornar todas as propriedades opcionais.
 * Observação: CreateCardDto está vazio no momento.
 */
export class UpdateCardDto extends PartialType(CreateCardDto) {}
