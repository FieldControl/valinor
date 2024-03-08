import { IsNotEmpty } from "class-validator";

export class CreateBadgeDto {
    @IsNotEmpty({ message: "O nome da badge não pode ser vazio" })
    name: string;
    @IsNotEmpty({ message: "A cor da badge não pode ser vazio" })
    color: string;
}