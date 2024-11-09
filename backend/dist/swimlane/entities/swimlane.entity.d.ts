import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';
export declare class Swimlane {
    id: number;
    name: string;
    order: number;
    boardId: number;
    board: Board;
    cards: Card[];
}
