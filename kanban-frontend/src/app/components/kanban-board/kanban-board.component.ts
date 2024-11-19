import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../../services/kanban.service.js';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns = [];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.kanbanService.getColumns().subscribe((data) => {
      this.columns = data;
    });
  }

  addColumn(title: string) {
    this.kanbanService.addColumn(title).subscribe(() => {
      this.loadColumns();
    });
  }
}