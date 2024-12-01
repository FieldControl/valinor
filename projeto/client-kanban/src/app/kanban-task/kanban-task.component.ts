import { Component, Input } from '@angular/core';
import { Task } from '../shared/models/task';
import { TaskService } from '../services/task.service';
import { KanbanService } from '../services/kanban.service';

@Component({
  selector: 'app-kanban-task',
  imports: [],
  templateUrl: './kanban-task.component.html',
  styleUrl: './kanban-task.component.css'
})
export class KanbanTaskComponent {
  @Input() task!: Task

  constructor(private taskService: TaskService, private kanbanService: KanbanService) { }

  handleEdit() {
    console.log('aqui2')
    console.log(this.task.id_column)
    this.kanbanService.editTask(this.task.id, this.task.description, this.task.id_column);
  }

  async handleDelete() {
    await this.taskService.deleteTask(Number(this.task.id))

    this.kanbanService.notifyRefreshColumns();
  }
}
