import { Board } from "src/boards/entities/board.entity";
import { Card } from "src/cards/entities/card.entity";

export class CreateColumnDto {
    name: string;
    board: Board;
    cards: Card[];
}
