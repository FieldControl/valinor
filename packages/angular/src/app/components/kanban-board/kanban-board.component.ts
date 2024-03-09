import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ColumnComponent } from '../column/column.component';
import { ApiService } from '../../services/api.service';
import { Column, Project } from '../../models/kanban.model';
import { ButtonComponent } from '../button/button.component';
import { MatIconModule } from '@angular/material/icon';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Subject } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [ColumnComponent, ButtonComponent, MatIconModule, TaskCardComponent],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  projects!: Project[];
  columns!: Column[];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllColumns(this.projectId).subscribe((columnsData) => {
      this.columns = columnsData;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.updateColumn()
    }
  }

  createColumn() {
    this.apiService.createColumn(this.projectId, 'New column').subscribe((res) => {
      console.log('coluna criada'), res;
      this.apiService.getAllColumns(this.projectId).subscribe((columnsData) => (this.columns = columnsData));
    });
  }

  updateColumn() {
    console.log("update column")
    this.apiService.getAllColumns(this.projectId).subscribe((columnsData) => {this.columns = columnsData
    console.log(columnsData)});
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }
}
