import { PartialType } from '@nestjs/mapped-types';
import { CreateColumnDto } from './create-column.dto';
import { UpdateColumnDto as SharedUpdateColumnDto } from '@test/shared-types';

export class UpdateColumnDto
  extends PartialType(CreateColumnDto)
  implements SharedUpdateColumnDto {}
