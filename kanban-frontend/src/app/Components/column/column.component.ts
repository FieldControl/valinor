import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Column } from '../../Models/column.model';
import { Task } from '../../Models/task.model';
import { TaskService } from '../../Services/task.service';
import { ColumnService } from '../../Services/column.service';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html'
})
export class ColumnComponent {
  @Input() column!: Column;
  @Input() tasks: Task[] = [];
  @Output() taskCreated = new EventEmitter<void>();
  @Output() columnDeleted = new EventEmitter<string>();
  @Output() taskDeleted = new EventEmitter<string>();

  showTaskForm: boolean = false;
  newTaskTitle: string = '';
  newTaskDescription: string = '';

  constructor(
    private taskService: TaskService,
    private columnService: ColumnService
  ) {}

  toggleTaskForm(): void {
    this.showTaskForm = !this.showTaskForm;
  }

  createTask(): void {
    if (this.newTaskTitle.trim()) {
      const newTask: Task = {
        id: '',
        title: this.newTaskTitle.trim(),
        description: this.newTaskDescription,
        columnId: this.column.id,
      };
      this.taskService.createTask(newTask).subscribe((task) => {
        this.tasks.push(task);
        this.newTaskTitle = '';
        this.newTaskDescription = '';
        this.showTaskForm = false;
        this.taskCreated.emit();
      });
    }
  }

  deleteTask(taskId: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
    this.taskDeleted.emit(taskId);
  }
}
