import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsPositive()
    columnId: number;
}