import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent implements OnInit {
  columns: any[] = [];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns(): void {
    this.kanbanService.getColumns().subscribe((data) => {
      this.columns = data;
    });
  }
}
