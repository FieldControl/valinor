import { Iboard } from "./board.interface";
import { Icard } from "./card.interface";

export interface Icolumn{
    name: string;
    order: number;
    boardId: number;
    board: Iboard;
    cards?: Icard[];
}