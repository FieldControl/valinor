import { IUsuario } from './usuario.modelo';

export interface IQuadro {
  id: number;
  nome: string;
  usuarios?: IUsuario[];
  colunas?: IColuna[];
}

export interface ICriarQuadro {
  name: string;
}
export interface IAtualizarColuna {
  id: number;
  nome: string;
}

export interface IColuna {
  id: number;
  nome: string;
  ordem: number;
  quadroId: number;
  quadro: IQuadro;
  cartoes?: ICartao[];
}

export interface ICriarColuna {
  nome: string;
  ordem: number;
  quadroId: number;
}

export interface ICartao {
  id: number;
  nome: string;
  conteudo: string;
  ordem: number;
  atribuir?: IUsuario;
  colunaId: number;
  cor?: string; 
  coluna: IColuna;
}
