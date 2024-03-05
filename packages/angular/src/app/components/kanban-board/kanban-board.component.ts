import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ColumnComponent } from '../column/column.component';
import { ApiService } from '../../services/api.service';
import { Column, Project } from '../../models/kanban.model';
import { ButtonComponent } from '../button/button.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [ColumnComponent, ButtonComponent, MatIconModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  projects!: Project[];
  columns!: Column[];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllColumns(this.projectId).subscribe((columnsData) => (this.columns = columnsData));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] || changes['columns']) {
      this.apiService.getAllColumns(this.projectId).subscribe((columnsData) => (this.columns = columnsData));
    }
  }

  createColumn() {
    this.apiService.createColumn(this.projectId, 'New column').subscribe((res) => {
      console.log('coluna criada'), res;
    });
    this.apiService.getAllColumns(this.projectId).subscribe((columnsData) => (this.columns = columnsData));
  }
}
