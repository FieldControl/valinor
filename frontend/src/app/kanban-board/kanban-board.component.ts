import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../services/kanban.service';
import { Column } from '../models/column.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.kanbanService.getColumns().subscribe({
      next: (columns) => {
        this.columns = columns;
      },
      error: (err) => {
        console.error('Erro ao buscar colunas: ', err);
      },
    });
  }
}
