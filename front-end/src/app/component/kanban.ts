import { Card } from "./card";

export interface Kanban{
  id?: string,
  name: String,
  searchCard?:string,
  cards?: Card[]
}
