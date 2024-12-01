import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../services/kanban.service';
import { ColumnService } from '../services/column.service';
import { Column } from '../shared/models/column';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [KanbanColumnComponent, CommonModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(
    private columnService: ColumnService,
    private kanbanService: KanbanService
  ) {}

  ngOnInit(): void {
    this.fetchColumns();

    this.kanbanService.refreshColumns$.subscribe(() => {
      this.fetchColumns();
    });
  }

  fetchColumns() {
    this.columnService.getColumns().then(({ data }: any) => {
      this.columns = [...data.columns];
    });
  }
}