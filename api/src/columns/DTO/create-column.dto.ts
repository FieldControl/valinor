import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateColumnDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsPositive()
    position: number;

    @IsNumber()
    @IsPositive()
    boardId: number;
}