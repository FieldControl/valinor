import { IUser } from './user.model';

export interface IQuadro {
  id: number;
  nome: string;
  usuarios?: IUser[];
  colunas?: IColuna[];
}

export interface ICreateQuadro {
  nome: string;
}
export interface IUpdateSColuna {
  id: number;
  nome: string;
}

export interface IColuna {
  id: number;
  nome: string;
  ordem: number;
  quadroId: number;
  quadro: IQuadro;
  cards?: ICard[];
}

export interface ICreateColuna {
  nome: string;
  ordem: number;
  quadroId: number;
}

export interface ICard {
  id: number;
  nome: string;
  conteudo: string;
  ordem: number;
  assigne?: IUser;
  colunaId: number;
  coluna: IColuna;
}