import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ColumnComponent } from '../column/column.component';
import { ApiService } from '../../services/api.service';
import { Column, Project } from '../../models/kanban.model';
import { ButtonComponent } from '../button/button.component';
import { MatIconModule } from '@angular/material/icon';
import { TaskCardComponent } from '../task-card/task-card.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [ColumnComponent, ButtonComponent, MatIconModule, TaskCardComponent, DragDropModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  projects!: Project[];
  columns!: Column[];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAllColumns(this.projectId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.updateColumns();
    }
  }

  getAllColumns(projectId: string) {
    this.apiService.getAllColumns(projectId).subscribe((columnsData) => {
      if ('message' in columnsData && 'code' in columnsData) {
        return (this.columns = []);
      }
      return (this.columns = columnsData);
    });
  }

  createColumn() {
    this.apiService.createColumn(this.projectId, 'New column').subscribe(() => {
      this.getAllColumns(this.projectId);
    });
  }

  updateColumns() {
    this.getAllColumns(this.projectId);
  }
}
