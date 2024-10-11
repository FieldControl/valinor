import { KanbanTask } from './kanban-task.interface';

export interface KanbanList {
  id: number;
  title: string;
  tasks: KanbanTask[];
}
