import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { UpdateCardDto as SharedUpdateCardDto } from '@test/shared-types';

export class UpdateCardDto
  extends PartialType(CreateCardDto)
  implements SharedUpdateCardDto {}
