import { PartialType } from '@nestjs/mapped-types';
import { CreateColumnDto } from './create-column.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateColumnDto extends PartialType(CreateColumnDto) {
  @ApiPropertyOptional({ description: 'Novo título da coluna' })
  title?: string;

  @ApiPropertyOptional({ description: 'Nova ordem da coluna' })
  order?: number;
}
