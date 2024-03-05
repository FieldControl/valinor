import { Card } from "./card";

export interface Kanban{
  id: number,
  name: String,
  searchCard:string,
  cards: Card[]
}
