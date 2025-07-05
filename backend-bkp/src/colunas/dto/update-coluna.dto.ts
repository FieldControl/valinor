import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateColunaDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    titulo?: string;
}
