import { Component, Input } from '@angular/core';
import { TaskService } from '../services/task.service';
import { KanbanService } from '../services/kanban.service';
import { Column } from '../shared/models/column';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    KanbanTaskComponent,
    CommonModule,
    DialogModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
  ],
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.css'],
})
export class KanbanColumnComponent {
  @Input() column!: Column;
  value: string | undefined;
  visible: boolean = false;

  constructor(
    private taskService: TaskService,
    private kanbanService: KanbanService
  ) { }

  showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.visible = false;
    this.value = undefined;
  }

  async handleSubmit() {
    if (!this.value) return;

    await this.taskService.createTask({
      description: this.value,
      id_column: Number(this.column.id),
    });

    this.kanbanService.notifyRefreshColumns(); // Notifica o serviço para atualizar as colunas
    this.value = undefined;
    this.visible = false;
  }
}