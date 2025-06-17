import { Column } from './column.model';
import { User } from './user.model'; 

export interface Board {
  id: number;
  title: string;
  ownerId?: number; // O ID do proprietário
  owner?: User;     // O objeto User do proprietário (opcional)
  members?: User[]; // Lista de membros do board (opcional)
  columns?: Column[]; // Lista de colunas do board (opcional)
}