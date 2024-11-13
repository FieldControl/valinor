import { Column } from "../column/column.interface";

export interface Card {
  id?: number;
  title?: string;
  description?: string;
  position?: number;
  createdAt?: Date;
  createdBy?: number;
  updatedAt?: Date;
  updatedBy?: number;
  columnId?: number;
  column?: Column;
}
