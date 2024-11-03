import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateLaneDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    boardId: number;
    @IsNumber()
    order: number;
    @IsNumber()
    status: number;
}
