export interface Card {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  columnId: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}
