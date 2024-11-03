import { IsNotEmpty, IsNotEmptyObject, IsNumber, isNumber } from "class-validator";
import { Lane } from "../../lanes/entities/lane.entity";

export class CreateTaskDto {
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
    @IsNotEmpty()
    targetDate: Date;
    @IsNotEmpty()
    laneId: number;
    @IsNumber()
    status: number;
}
