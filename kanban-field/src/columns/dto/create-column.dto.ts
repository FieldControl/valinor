import { Board } from "src/boards/entities/board.entity";
import { Card } from "src/cards/entities/card.entity";
import { User } from "src/users/entities/user.entity";

export class CreateColumnDto {
    name: string
    board: string
    responsibles: User[]
    cards: Card[]
}
