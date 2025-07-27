import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskService, Task } from './task.service';
import { AddTaskDialog } from './add-task-dialog/add-task-dialog';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './kanban.html',
  styleUrls: ['./kanban.css'],
})

export class Kanban implements OnInit {
  tasks: Task[] = [];
  steps = ['To Do', 'Work in Progress', 'Done'];

  editingTask: Task | null = null;

  constructor(private taskService: TaskService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: tasks => (this.tasks = tasks),
      error: err => console.error('Failed to load tasks', err),
    });
  }

  tasksByStep(step: number): Task[] {
    return this.tasks.filter(t => t.step === step);
  }

  openAddTaskDialog() {
  const dialogRef = this.dialog.open(AddTaskDialog);

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.taskService
        .createTask(result.name, result.desc, Number(result.step))  // <-- add Number() here
        .subscribe({
          next: () => this.loadTasks(),
          error: err => console.error('Failed to create task', err),
        });
    }
  });
}

  editTask(task: Task) {
    this.editingTask = { ...task };
  }

  saveTask() {
    if (!this.editingTask) return;

    this.taskService
      .updateTask(
        this.editingTask.id,
        this.editingTask.name,
        this.editingTask.desc,
        Number(this.editingTask.step)
      )
      .subscribe({
        next: () => {
          this.editingTask = null;
          this.loadTasks();
        },
        error: err => console.error('Failed to update task', err),
      });
  }

  cancelEdit() {
    this.editingTask = null;
  }
  deleteTask() {
  if (!this.editingTask) return;

  this.taskService.removeTask(this.editingTask.id).subscribe({
    next: () => {
      this.editingTask = null;
      this.loadTasks();
    },
    error: err => console.error('Failed to delete task', err),
    });
  }
}
