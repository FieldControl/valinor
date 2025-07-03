import {IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCardDTO {
    
    @IsString()
    @IsNotEmpty()
    title: string;
    
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    columnId: string;
}