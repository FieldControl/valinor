import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @ApiPropertyOptional({ description: 'Novo título do card' })
  title?: string;

  @ApiPropertyOptional({ description: 'Nova descrição do card' })
  description?: string;

  @ApiPropertyOptional({ description: 'Nova ordem do card' })
  order?: number;

  @ApiPropertyOptional({ description: 'Novo ID de coluna do card' })
  columnId?: number;
}
