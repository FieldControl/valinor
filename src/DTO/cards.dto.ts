import { IsNotEmpty } from 'class-validator';

export class CardDTO {

    @IsNotEmpty()
    readonly name : String

}