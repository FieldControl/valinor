// frontend/src/app/board/board.component.ts
import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../kanban-service/kanban.service';
import { Column } from './column.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];
  newColumnTitle: string = '';

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns(): void {
    this.kanbanService.getColumns().subscribe(columns => {
      this.columns = columns;
    });
  }

  addColumn(): void {
    if (this.newColumnTitle) {
      this.kanbanService.createColumn(this.newColumnTitle).subscribe(column => {
        this.columns.push(column);
        this.newColumnTitle = ''; // Reset input field
      });
    }
  }
}
