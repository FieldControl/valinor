import { Card } from "../../cards/card";

export interface Column{
  id: number,
  name: string,
  cards: Card[];
}
