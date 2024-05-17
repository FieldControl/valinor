import {IsString, Length} from "class-validator";

export class CreateColunaDto {
    @IsString({message: 'Coluna deve ser uma string.'})
    @Length(3, 20, {message: 'Coluna deve ter ao menos tres caractere'})
    title: string;
}
