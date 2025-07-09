export interface Card {
  id: string;
  title: string;
  description?: string;
  column_id: string;
  position: number;
  color?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCardInput {
  title: string;
  description?: string;
  column_id: string;
  position?: number;
  color?: string;
  due_date?: string;
}

export interface UpdateCardInput {
  id: string;
  title?: string;
  description?: string;
  color?: string;
  due_date?: string;
}

export interface MoveCardInput {
  id: string;
  column_id: string;
  newPosition: number;
} 