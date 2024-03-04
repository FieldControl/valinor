import { Component, OnInit } from '@angular/core';
import { ColumnComponent } from '../column/column.component';
import { ApiService } from '../../services/api.service';
import { Column } from '../../models/kanban.model';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [ColumnComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit {
  projectId!: string
  columns!: Column[];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllColumns(this.projectId).subscribe({
      next(value) {
        console.log(value)
      },
    })
  }

  updateProjectColumns(projectId: string): void {
    this.apiService.getAllColumns(projectId).subscribe((columnsData) => (this.columns = columnsData));
  }
}
