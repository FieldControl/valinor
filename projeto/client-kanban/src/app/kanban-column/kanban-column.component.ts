import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

import { Component, Input, OnInit } from '@angular/core';
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
export class KanbanColumnComponent implements OnInit {
  @Input() column!: Column;
  value: string | undefined;
  id: number = 0;
  id_column: number = 0;
  visible: boolean = false;
  editTask: boolean = false;

  constructor(
    private columnService: ColumnService,
    private taskService: TaskService,
    private kanbanService: KanbanService,
  ) { }

  ngOnInit(): void {
    this.kanbanService.editTask$.subscribe(({ id, description, id_column }) => {
      console.log(this.column.id, id_column)
      if (Number(this.column.id) === Number(id_column)) {
        this.visible = true
        this.editTask = true
        this.value = description
        this.id = Number(id)
        this.id_column = Number(id_column)
      }
    });
  }
  showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.value = undefined;
    this.editTask = false;
    this.id = 0;
    this.id_column = 0;
    this.visible = false;
  }

  async handleSubmit() {
    if (!this.value) return;

    if (this.editTask) {
      await this.taskService.updateTask({
        description: this.value,
        id_column: Number(this.column.id),
        id: this.id,
      });
    } else {
      await this.taskService.createTask({
        description: this.value,
        id_column: Number(this.column.id),
      });
    }

    this.kanbanService.notifyRefreshColumns();

    this.hideDialog()
  }

  handleEdit() {
    console.log('aqui')
    this.kanbanService.editColumn(this.column.id, this.column.description);
  }

  async handleDelete() {
    await this.columnService.deleteColumn(Number(this.column.id))

    this.kanbanService.notifyRefreshColumns();
  }
}