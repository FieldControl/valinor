import { KanbanTask } from './kanban-task.interface';

let nextId = 1000;

export class KanbanTaskFactory {
  static from({ id, description }: KanbanTask): KanbanTask {
    return { id, description };
  }

  static createDefault(): KanbanTask {
    return { id: nextId++, description: 'Tarefa nova' };
  }
}
