import { IsNotEmpty, IsString } from "class-validator";
import { Card } from "src/interface/card.interface";


export class CreateColumnDTO{
    @IsString()
    @IsNotEmpty()
    title: string;
    cards: Card[]
}