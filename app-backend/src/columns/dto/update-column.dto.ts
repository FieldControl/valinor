import { PartialType } from '@nestjs/mapped-types';
import { CreateColumnDto } from './create-column.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateColumnDto extends PartialType(CreateColumnDto) {}
