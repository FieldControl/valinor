import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDTO } from './create-card.dto';

export class UpdateCardDTO extends PartialType(CreateCardDTO) {}