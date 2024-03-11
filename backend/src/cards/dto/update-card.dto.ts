import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Badge } from '../../badges/entities/badge.entity';

export class UpdateCardDto extends PartialType(CreateCardDto) {
    @IsNotEmpty({ message: "O cartão tem que estar vinculado a uma lista" })
    @IsOptional()
    kanban_id?: string;
    @IsNotEmpty({message:"Titulo do cartão não pode estar nulo"})
    @IsOptional()
    title?: string;
    @IsNotEmpty({ message: "Descrição do cartão não pode ser enviada sem nada" })
    @IsOptional()
    description?: string;
    @IsNotEmpty({ message: "Data final do cartão não pode ser enviado sem nada" })
    @IsOptional()
    date_end?: Date
    @IsNotEmpty({ message: "A ordem do cartão não pode ser vazia" })
    @IsOptional()
    order?: number
    @IsOptional()
    badges?: Badge[]
}
