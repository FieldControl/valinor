import { PartialType } from '@nestjs/mapped-types';
import { CreateKanbanDto } from './create-kanban.dto';

export class UpdateKanbanDto extends PartialType(CreateKanbanDto) {}
