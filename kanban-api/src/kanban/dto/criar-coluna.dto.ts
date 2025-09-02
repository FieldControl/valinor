import { IsNotEmpty, IsNumber } from 'class-validator';
export class CriarColunaDto {
	@IsNotEmpty() titulo: string;
	@IsNumber() ordem: number;
	@IsNotEmpty() quadroId: string;
}