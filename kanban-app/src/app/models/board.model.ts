export interface Board {
  id: string;
  name: string;
  columns?: Column[];
}

export interface Column {
  id: string;
  title: string;
  order: number;
  board: Board;
  cards?: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  order: number;
  column: Column;
}

export interface CreateBoardInput {
  name: string;
}

export interface CreateColumnInput {
  boardId: number;
  title: string;
}

export interface CreateCardInput {
  columnId: number;
  title: string;
  description: string;
  order?: number;
}

export interface UpdateBoardInput {
  id: number;
  name: string;
}

export interface UpdateColumnInput {
  id: number;
  title: string;
}

export interface UpdateCardInput {
  id: number;
  title: string;
  description: string;
  columnId: number;
}

export interface MoveCardInput {
  id: number;
  columnId: number;
}

export interface ReorderCardInput {
  id: number;
  newIndex: number;
}
