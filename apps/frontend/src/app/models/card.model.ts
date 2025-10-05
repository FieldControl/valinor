export interface Card {
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  priority: 'low' | 'medium' | 'high';
  columnId: number;
  column?: any; // Will be Column but avoiding circular import
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

// Note: Column interface is imported where needed to avoid circular imports
