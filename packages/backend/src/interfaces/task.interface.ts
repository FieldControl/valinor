import { Document } from 'mongoose';

export interface Task extends Document {
  _id_project: string;
  _id_column: string;
  title: string;
  description: string;
  archived: boolean;
}
