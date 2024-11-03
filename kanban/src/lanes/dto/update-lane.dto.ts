import { PartialType } from '@nestjs/mapped-types';
import { CreateLaneDto } from './create-lane.dto';

export class UpdateLaneDto extends PartialType(CreateLaneDto) {}
