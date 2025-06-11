import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateCardDto extends PartialType(CreateCardDto) {}
