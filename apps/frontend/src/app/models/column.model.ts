export interface Column {
  id: number;
  title: string;
  description?: string;
  position: number;
  color: string;
  cards: any[]; // Will be Card[] but avoiding circular import
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateColumnRequest {
  title: string;
  description?: string;
  position?: number;
  color?: string;
}

export interface UpdateColumnRequest {
  title?: string;
  description?: string;
  position?: number;
  color?: string;
}

export interface ColumnPositionUpdate {
  id: number;
  position: number;
}
