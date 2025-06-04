import { Card } from "../models/card.model";

export interface BoardColumn {
  id: number;
  title: string;
  cards: Card[];
}