import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnsService } from '../services/columns.service';
import { KanbanColumn } from '../kanban-column.model';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban.html',
  styleUrls: ['./kanban.css'],
})
export class Kanban implements OnInit {
  columns: KanbanColumn[] = [];

  constructor(private columnsService: ColumnsService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns() {
    this.columnsService.getColumns().subscribe((data) => {
      this.columns = data;
    });
  }
}
