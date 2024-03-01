import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { Task } from '../../models/task.model';
import { Column } from '../../models/column.model';
import { Board } from '../../models/board.model';

import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-main-view',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss'
})

export class MainViewComponent {

  board: Board = new Board('Test Board', []);

  addColumn(): void {
    const newColumn = new Column('New Column', []);
    this.board.columns.push(newColumn);
  }

  addTask(column: Column): void {
    const newTask = new Task('New Task', 'Task Description');
    column.tasks.push(newTask);
    column.temporaryTaskNames.push(newTask);
  }

  editColumnName(column: Column, newName: string): void {
    column.name = newName; //toUpperCase() não parece uma boa opção nesse caso, mas qualquer coisa é só colocar na frente do newName
  }

  setTemporaryTaskValue(column: Column, task: Task, index: number): void {
    column.temporaryTaskNames[index] = task;
  }

  editTaskName(column: Column, index: number): void {
    column.tasks[index] = column.temporaryTaskNames[index];
  }

  resetTemporaryTaskNames(): void {
    this.board.columns.forEach(column => {
      column.temporaryTaskNames = [];
      column.tasks.forEach(task => {
        column.temporaryTaskNames.push(task);
      });
    });
  }

  deleteColumn(column: Column): void {
    const columnIndex = this.board.columns.indexOf(column);
    if (columnIndex !== -1) {
      this.board.columns.splice(columnIndex, 1);
    }
  }

  deleteTask(column: Column, index: number): void {
    const columnIndex = this.board.columns.indexOf(column);
    column.tasks.splice(index, 1);
    column.temporaryTaskNames.splice(index, 1);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.resetTemporaryTaskNames();
  }

}
