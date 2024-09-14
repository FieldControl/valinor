import { Iboard } from "./board.interface";
import { Icard } from "./card.interface";

export interface Icolumn{
    name: string;
    order: number;
    boardId: number;
    board: Iboard;
    cards?: Icard[];
}

export interface ICreateColumn{
    name: string;
    order: number;
    boardId: number;
  }

  export interface IUpdateColumn {
    id: number;
    name: string;
  }