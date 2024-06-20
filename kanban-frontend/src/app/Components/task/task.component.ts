import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../Models/task.model';
import { TaskService } from '../../Services/task.service';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html'
})
export class TaskComponent {
  @Input() task!: Task;
  @Output() taskDeleted = new EventEmitter<string>();

  showMenu: boolean = false;
  isEditing: boolean = false;
  editTitle: string = '';
  editDescription: string = '';

  constructor(private taskService: TaskService) {}

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  startEdit(): void {
    this.editTitle = this.task.title;
    this.editDescription = this.task.description || '';
    this.isEditing = true;
    this.showMenu = false;
  }

  saveEdit(): void {
    if (this.editTitle.trim()) {
      const updatedTask: Task = {
        ...this.task,
        title: this.editTitle.trim(),
        description: this.editDescription,
      };
      this.taskService
        .updateTask(this.task.id, updatedTask)
        .subscribe((updatedTask) => {
          this.task.title = updatedTask.title;
          this.task.description = updatedTask.description;
          this.isEditing = false;
        });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  deleteTask(): void{
    this.taskService.deleteTask(this.task.id).subscribe((taskId) => {
      this.taskDeleted.emit(taskId);
    })
  }
}
