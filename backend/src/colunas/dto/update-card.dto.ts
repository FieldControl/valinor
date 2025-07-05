import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateCardDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    titulo?: string;

    @IsOptional()
    @IsString()
    descricao?: string;
}
