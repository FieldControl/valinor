import { IsString } from "class-validator";

export class CreateCardDto {
    @IsString({message: 'Nome Invalido'})
    cli: string;
    
}
