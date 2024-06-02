import { PartialType } from '@nestjs/mapped-types';
import { CreateSwimlaneDto } from './create-swimlane.dto';

export class UpdateSwimlaneDto extends PartialType(CreateSwimlaneDto) {}
