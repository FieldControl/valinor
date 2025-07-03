import { IsNotEmpty, IsString } from "class-validator";


export class CreateColumnDTO{
    @IsString()
    @IsNotEmpty()
    title: string;
}