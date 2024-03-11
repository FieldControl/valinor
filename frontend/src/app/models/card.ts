import { Badge } from "./badge";

export interface Card{
  id?: string,
  kanban_id: string,
  title: String,
  createdAt?: Date,
  date_end?: Date|null,
  order: number;
  badges?: Badge[],
  description?: String | null
}

export interface CardUpdate{
  id?: string,
  kanban_id?: string,
  title?: String,
  date_end?: Date|null,
  order?: number;
  badges?: Badge[],
  description?: String | null
}
