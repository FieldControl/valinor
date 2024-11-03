import { IsNotEmpty, isNumber, IsNumber } from "class-validator";

export class CreateBoardDto {
    @IsNotEmpty()
    name: string;
    @IsNumber()
    userId: number;
    @IsNumber()
    status: number; // 1: active, 0: inactive
}
