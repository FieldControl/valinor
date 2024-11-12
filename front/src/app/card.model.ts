export interface Card {
  id?: number;  
  title: string;
  description: string;
  column: number;
  isEditing?: boolean;
  order: number;
}
