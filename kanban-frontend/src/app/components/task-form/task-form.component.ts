import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  @Output() createTask = new EventEmitter<string>();

  title = '';

  onSubmit() {
    if (this.title.trim()) {
      this.createTask.emit(this.title);
      this.title = '';
    }
  }

  constructor(private taskService: TaskService) {}

  addTask(event: Event) {
    event.preventDefault();
    if (this.title.trim()) {
      this.taskService.addTask(this.title.trim());
      this.title = '';
    }
  }
}
