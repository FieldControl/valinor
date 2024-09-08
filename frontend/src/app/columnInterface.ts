import { Card } from "./cardInterface"

export interface Column {
  id: string
  order:number
  title: string
  cards: Card[]
}