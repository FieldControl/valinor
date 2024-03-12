import { Document } from 'mongoose';

export interface Project extends Document {
  title: string;
}
