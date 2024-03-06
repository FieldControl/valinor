import { PartialType } from '@nestjs/mapped-types';
import { CreateKanbanDto } from './create-kanban.dto';
import { CreateCardDto } from './create-card.dto';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateKanbanDto extends PartialType(CreateKanbanDto) {
    @IsNotEmpty({ message: "O nome da lista não pode ser vazio" })
    @IsOptional()
    name?: string;
    @IsArray()
    @IsOptional()
    cards?: CreateCardDto[];
}
