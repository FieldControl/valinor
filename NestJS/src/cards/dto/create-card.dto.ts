import { IsNotEmpty, IsString } from "class-validator";

export class CreateCardDto {
    @IsNotEmpty({message: 'Nome Invalido'})
    cli: string;
  
}
