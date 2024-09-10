import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Task } from '../../types/task.interface';
import { Column } from '../../types/column.interface';
import { ColumnsService } from '../../services/columns.service';

@Component({
  selector: 'app-task-container',
  templateUrl: './task-container.component.html',
  styleUrl: './task-container.component.scss',
})
export class TaskContainerComponent {
  @Input() column!: Column;

  tasks: Task[] = [
    {
      id: '1',
      title: 'First task',
      description: 'First task description',
      position: 1,
      columnId: '1',
      createdAt: '07/09/2024 08h51m24s',
      updatedAt: '08/09/2024 10h32m44s',
    },
  ];

  taskFormGroup!: FormGroup;
  columnFormGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private columnsService: ColumnsService
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

  updateColumn(): void {
    this.columnsService.updateColumn(this.column.id, {
      title: this.columnFormGroup.value.title,
    });
  }

  deleteColumn(): void {
    this.columnsService.deleteColumn(this.column.id);
  }
}
