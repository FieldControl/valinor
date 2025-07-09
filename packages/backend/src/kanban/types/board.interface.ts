export interface Board {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardInput {
  title: string;
  description?: string;
}

export interface UpdateBoardInput {
  id: string;
  title?: string;
  description?: string;
} 