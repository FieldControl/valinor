import { Card } from "./card.model";
import { Column } from "./column.model";

export interface Kanban {
    columns: Column[];
    cards: Card[];
  }