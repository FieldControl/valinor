import { Component, Input } from '@angular/core';
import { Task } from '../shared/models/task';
import { TaskService } from '../services/task.service';
import { KanbanService } from '../services/kanban.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-kanban-task',
  templateUrl: './kanban-task.component.html',
  styleUrl: './kanban-task.component.css',
  imports: [ConfirmPopupModule],
  providers: [ConfirmationService],
})
export class KanbanTaskComponent {
  @Input() task!: Task

  constructor(
    private taskService: TaskService,
    private kanbanService: KanbanService,
    private confirmationService: ConfirmationService
  ) { }

  handleEdit() {
    this.kanbanService.editTask(this.task.id, this.task.description, this.task.id_column);
  }

  async handleDelete(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Deseja excluir essa tarefa?',
      header: 'Excluir Tarefa',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: async () => {
        await this.taskService.deleteTask(Number(this.task.id))

        this.kanbanService.notifyRefreshColumns();
      },
    });
  }
}
