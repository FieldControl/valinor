export interface Card {
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  priority: 'low' | 'medium' | 'high';
  columnId: number;
  column?: Column;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  position?: number;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  columnId: number;
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  position?: number;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  columnId?: number;
}

export interface CardPositionUpdate {
  id: number;
  position: number;
  columnId?: number;
}

export interface MoveCardRequest {
  columnId: number;
  position: number;
}
