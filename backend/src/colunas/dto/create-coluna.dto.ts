import { IsString, MinLength } from 'class-validator';

export class CreateColunaDto {
    @IsString()
    @MinLength(3)
    titulo: string;
}

