import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

// A classe PartialType automaticamente torna todos os campos
// de CreateCardDto opcionais. É uma forma prática do NestJS.
export class UpdateCardDto extends PartialType(CreateCardDto) {}