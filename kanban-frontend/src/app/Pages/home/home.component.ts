import { Component, OnInit } from '@angular/core';
import { Column } from '../../Models/column.model';
import { Task } from '../../Models/task.model';
import { ColumnService } from '../../Services/column.service';
import { TaskService } from '../../Services/task.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  columns: Column[] = [];
  tasks: Task[] = [];
  showModal: boolean = false;
  newColumnTitle: string = '';
  faTrash = faTrash;

  constructor(
    private columnService: ColumnService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadColumns();
    this.loadTasks();
  }

  loadColumns(): void {
    this.columnService.getAllColumns().subscribe((columns) => {
      this.columns = columns;
    });
  }

  loadTasks(): void {
    this.taskService.getAllTasks().subscribe((tasks) => {
      this.tasks = tasks;
    });
  }

  getTasksForColumn(columnId: string): Task[] {
    return this.tasks.filter((task) => task.columnId === columnId);
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  createColumn(): void {
    if (this.newColumnTitle.trim()) {
      const newColumn: Column = { id: '', title: this.newColumnTitle.trim() };
      this.columnService.createColumn(newColumn).subscribe((column) => {
        this.columns.push(column);
        this.newColumnTitle = '';
        this.showModal = false;
      });
    }
  }

  deleteColumn(columnId: string): void {
    this.columnService.deleteColumn(columnId).subscribe(() => {
      this.columns = this.columns.filter((column) => column.id !== columnId);
    });
  }

  dropTask(event: CdkDragDrop<Task[]>, columnId: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const task: Task = event.previousContainer.data[event.previousIndex];
      task.columnId = columnId;
      this.taskService.updateTask(task.id, task).subscribe(() => {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.loadTasks();
      });
    }
  }
}
