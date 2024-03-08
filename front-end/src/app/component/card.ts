import { Badge } from "./badge";

export interface Card{
  id?: string,
  kanban_id: string,
  title: String,
  date_created?: Date,
  date_end?: Date|null,
  badges?: Badge[],
  description?: String | null
}
