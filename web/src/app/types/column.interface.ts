import { Task } from './task.interface';

export interface Column {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}
