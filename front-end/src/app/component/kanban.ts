import { Card } from "./card";

export interface Kanban{
  id: number,
  name: String,
  cards: Card[]
}
