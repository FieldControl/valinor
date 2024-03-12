import { Document } from 'mongoose';

export interface Column extends Document {
  _id_project: string;
  title: string;
}
