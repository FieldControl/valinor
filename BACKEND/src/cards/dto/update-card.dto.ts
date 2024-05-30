import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) {

    readonly title: string;
    readonly description: string;
    readonly color: string;
    readonly cardColumn: string;

}

