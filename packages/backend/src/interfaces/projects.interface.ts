import { Document } from 'mongoose';

export interface Project extends Document {
  title: string;
  columns: Array<Column>;
}

export interface Column {
  id: number;
  id_project: number;
  title: string;
  tasks: Array<Task>;
  excluded: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  archived: boolean;
}
