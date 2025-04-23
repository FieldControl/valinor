import { Task } from "./task.model";

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}