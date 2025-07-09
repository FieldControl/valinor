export interface Column {
  id: string;
  title: string;
  board_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateColumnInput {
  title: string;
  board_id: string;
  position?: number;
}

export interface UpdateColumnInput {
  id: string;
  title?: string;
  position?: number;
}

export interface MoveColumnInput {
  id: string;
  newPosition: number;
} 