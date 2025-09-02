import { IsNotEmpty } from 'class-validator';
export class CriarQuadroDto { @IsNotEmpty() nome: string; }