import { IsNotEmpty, IsUUID } from "class-validator";
import { BadgeDto } from "./badge.dto";

export class CreateCardDto {
    @IsUUID(undefined,{message:'Id de usuário inválido'})
    kanbanId: string
    @IsNotEmpty({ message: "O nome da lista não pode ser vazio" })
    title: string;
    description: string;
    date_end: Date
    badges: BadgeDto[]
}