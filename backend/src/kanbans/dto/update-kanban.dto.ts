import { PartialType } from '@nestjs/mapped-types';
import { CreateKanbanDto } from './create-kanban.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateKanbanDto extends PartialType(CreateKanbanDto) {
    @IsNotEmpty({ message: "O nome da lista não pode ser vazio" })
    @IsOptional()
    name?: string;
}
