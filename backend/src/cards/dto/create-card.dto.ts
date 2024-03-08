import { IsNotEmpty, IsUUID } from "class-validator";

export class BadgeDto {
    id: string
    name: string;
    color: string;
}

export class CreateCardDto {
    @IsUUID(undefined,{message:'Id da lista inválido'})
    kanban_id: string
    @IsNotEmpty({ message: "O nome da lista não pode ser vazio" })
    title: string;
    description: string;
    date_end: Date
    badges: BadgeDto[]
}