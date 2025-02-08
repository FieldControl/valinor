export interface IBoard {
  id: number;
  name: string;
  columns?: IColumn[];
}

export interface ICreateBoard {
  name: string;
}
export interface IUpdateColumn {
  id: number;
  name: string;
}

export interface IColumn {
  id: number;
  name: string;
  order: number;
  boardId: number;
  board: IBoard;
  cards?: ICard[];
}

export interface ICreateColumn {
  name: string;
  order: number;
  boardId: number;
}

export interface ICard {
  id: number;
  name: string;
  content: string;
  order: number;
  columnId: number;
  column: IColumn;
}
