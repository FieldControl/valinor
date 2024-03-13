import { IsNotEmpty } from "class-validator";

export class CreateKanbanDto {
    @IsNotEmpty({message: "O nome da lista não pode ser vazio"})
    name: string;
}