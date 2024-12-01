import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Column } from '../shared/models/column';

import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';

import { TaskService } from '../services/task.service';
import { KanbanService } from '../services/kanban.service';
import { ColumnService } from '../services/column.service';

@Component({
  selector: 'app-kanban-column',
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.css'],
  standalone: true,
  imports: [
    KanbanTaskComponent,
    CommonModule,
    DialogModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
  ],
})
export class KanbanColumnComponent {
  @Input() column!: Column;
  value: string | undefined;
  visible: boolean = false;

  constructor(
    private columnService: ColumnService,
    private taskService: TaskService,
    private kanbanService: KanbanService,
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

    this.kanbanService.notifyRefreshColumns();
    this.value = undefined;
    this.visible = false;
  }

  editColumn() {
    this.kanbanService.editColumn(this.column.id, this.column.description);
  }

  async handleDelete() {
    await this.columnService.deleteColumn(Number(this.column.id))

    this.kanbanService.notifyRefreshColumns();
  }
}