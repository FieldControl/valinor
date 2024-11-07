import { Card } from "./card";

export interface Column {
  id: number;
  name: string;
  Cards: Card[]
}

export interface CreateColumnBody {
  name: string;
}

export interface EditColumnBody {
  name: string;
}
