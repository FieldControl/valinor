import { IsNotEmpty, IsArray } from "class-validator";
import { CreateCardDto } from "./create-card.dto";

export class CreateKanbanDto {
    @IsNotEmpty({message: "O nome da lista não pode ser vazio"})
    name: string;
    @IsArray()
    cards: CreateCardDto[];
}