import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class CriarTarefaDto {
	@IsNotEmpty() titulo: string;
	@IsOptional() descricao?: string;
	@IsNumber() ordem: number;
	@IsNotEmpty() colunaId: string;
}