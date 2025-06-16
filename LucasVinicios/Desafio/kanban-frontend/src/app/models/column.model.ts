import { Board } from './board.model';
import { Card } from './card.model'

export interface Column{
    id: number;
    title: string;
    order: number;
    boardId?: number;
    board?: Board;
    cards?: Card[]
}