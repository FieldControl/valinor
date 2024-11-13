import { Board } from '../board/board.interface';

export interface Column {
  id?: number;
  name?: string;
  position?: number;
  createdAt?: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  userId?: number;
  board?: Board;
  boardId?: number;
}
