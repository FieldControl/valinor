import { IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class BadgeDto {
    id: string
    name: string;
    color: string;
}

export class CreateCardDto {
    @IsOptional()
    id?: string
    @IsUUID(undefined,{message:'Id da lista inválido'})
    kanban_id: string
    @IsNotEmpty({ message: "O nome do cartão não pode ser vazio" })
    title: string;
    @IsNotEmpty({ message: "A ordem do cartão não pode ser vazio" })
    order: number;
    description: string;
    date_end: Date
    badges: BadgeDto[]
}