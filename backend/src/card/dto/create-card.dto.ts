import {IsString, Length} from "class-validator";

export class CreateCardDto {
    @IsString({message: 'Card deve ser uma string.'})
    @Length(1, 200, {message: 'Card deve ter ao menos um caractere'})
    description: string;
}
