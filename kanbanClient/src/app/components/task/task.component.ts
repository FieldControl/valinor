import { Component, Input } from '@angular/core';
import { TaskModel } from '../../models/task.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Output, EventEmitter } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditTaskComponent } from './modal-edit-task/modal-edit-task.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [DragDropModule, MatCardModule, MatButtonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {
  constructor(private taskService: TaskService, private dialog: MatDialog) { }

  @Input('task')
  task: TaskModel = new TaskModel();
  @Output() editTask = new EventEmitter<TaskModel>();
  @Output() deleteTask = new EventEmitter<TaskModel>();

  convertToDescription(status: number) {
    switch (status) {
      case 1: return 'To Do';
      case 2: return 'In Progress';
      case 3: return 'Done';
      default: return '';
    }
  }
  edit(task?: TaskModel) {
    const dialogRef = this.dialog.open(ModalEditTaskComponent, {
      width: '95%',
      data: task
    });

    dialogRef.afterClosed().subscribe(result => {
      this.editTask.emit(result);
    });
  }
  delete(task: TaskModel) {
    this.taskService.deleteTask(task.id.toString()).subscribe((data) => {
      this.deleteTask.emit(task);
    });
  }
}
