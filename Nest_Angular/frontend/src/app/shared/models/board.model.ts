import { IUser } from './user.model';

export interface IBoard {
  id: number;
  nome: string;
  users?: IUser[];
  swimlanes?: ISwimlane[];
}

export interface ICreateSwimlane {
  nome: string;
  ordem: number;
  boardId: number;
}

export interface ICreateBoard {
  nome: string;
}

export interface IUpdateSwimlane {
  id: number;
  nome: string;
}
export interface ISwimlane {
  id: number;
  nome: string;
  ordem: number;
  boardId: number;
  board: IBoard;
  cards?: ICard[];
}

export interface ICard {
  id: number;
  nome: string;
  conteudo: string;
  ordem: number;
  responsavel?: IUser;
  swimlaneId: number;
  swimlane: ISwimlane;
}