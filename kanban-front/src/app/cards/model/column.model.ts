import { Card } from "./card.model";

export interface Column {
    id: number;
    title: string;
    card: Card[];
    showInput: boolean;
    isEditing: boolean;
  }