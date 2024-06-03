import { IUser } from './user.model';

export interface IBoard {
  id: number;
  name: string;
  users?: IUser[];
  swimlanes?: ISwimlane[];
}

export interface ICreateBoard {
  name: string;
}
export interface IUpdateSwimlane {
  id: number;
  name: string;
}

export interface ISwimlane {
  id: number;
  name: string;
  order: number;
  boardId: number;
  board: IBoard;
  cards?: ICard[];
}

export interface ICreateSwimlane {
  name: string;
  order: number;
  boardId: number;
}

export interface ICard {
  id: number;
  name: string;
  content: string;
  order: number;
  assigne?: IUser;
  swimlaneId: number;
  swimlane: ISwimlane;
}
