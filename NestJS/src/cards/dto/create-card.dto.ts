import { IsString } from "class-validator";

export class CreateCardDto {
    @IsString({message: 'Nome Invalido'})
    cli: string;
    
    @IsString({message: 'Negociação Invalida'})
    negociacao: string;
    
    @IsString({message: 'Concluída Invalida'})
    concluida: string;
    
    @IsString({message: 'Entrega Invalida'})
    entrega: string;
    
    @IsString({message: 'Venda Invalida'})
    venda: string;
}
