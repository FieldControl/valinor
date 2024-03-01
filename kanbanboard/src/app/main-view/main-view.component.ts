import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Column } from '../models/column.model';
import { Board } from '../models/board.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.scss'
})

export class MainViewComponent implements OnInit {

  board: Board | undefined;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.http.get<Column[]>('http://localhost:3000/columns').subscribe(columns => {
      this.board = new Board('Test Board', columns);
    });
  }

  drop(event: CdkDragDrop<string[]>) {
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
  }
  
  addColumn(): void {
    const newColumnName = prompt('Enter the name of the new column:');
    if (newColumnName) {
      this.board?.columns.push(new Column(newColumnName, []));
    }
  }

  addCard(columnName: string, newCardTitle: string): void {
    const column = this.board?.columns.find(col => col.name === columnName);
    if (column) {
      column.cards?.push(newCardTitle);
    }
   }
}
