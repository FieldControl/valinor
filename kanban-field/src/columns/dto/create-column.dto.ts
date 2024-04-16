import { Card } from "src/cards/entities/card.entity";

export class CreateColumnDto {
    name: string;
    cards: Card[];
}
