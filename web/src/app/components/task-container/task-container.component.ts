import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Task } from '../../types/task.interface';
import { Column } from '../../types/column.interface';
import { ColumnsService } from '../../services/columns.service';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-task-container',
  templateUrl: './task-container.component.html',
  styleUrl: './task-container.component.scss',
})
export class TaskContainerComponent {
  @Input() column!: Column;

  taskFormGroup!: FormGroup;
  columnFormGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private columnsService: ColumnsService,
    private tasksService: TasksService
  ) {}

  ngOnInit(): void {
    this.taskFormGroup = this.formBuilder.group({
      title: '',
      description: '',
    });

    this.columnFormGroup = this.formBuilder.group({
      title: this.column.title,
    });
  }

  createTask(): void {
    this.tasksService.createTask({
      title: this.taskFormGroup.value.title,
      description: this.taskFormGroup.value.description,
      columnId: this.column.id,
    });
  }

  updateColumn(): void {
    this.columnsService.updateColumn(this.column.id, {
      title: this.columnFormGroup.value.title,
    });
  }

  deleteColumn(): void {
    this.columnsService.deleteColumn(this.column.id);
  }
}
