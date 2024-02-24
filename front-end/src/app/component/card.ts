import { Badge } from "./badge";

export interface Card{
  id: number,
  title: String,
  date_created: Date,
  date_end: Date|null,
  badges: Badge[],
  description: String | null
}
