import { IUser } from './user.model';

export interface IBoard {
    idBoard: number;
    nameBoard: string;
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
    idSwimlane: number;
    nameSwimlane: string;
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
    idCard: number;
    nameCard: string;
    content: string;
    order: number;
    assigne?: IUser;
    swimlaneCod: number;
    swimlane: ISwimlane;
}
