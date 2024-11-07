import { Component, computed } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ColumnComponent } from '../column/column.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ColumnComponent],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
})
export class KanbanComponent {
  columns = computed(() => this.columnService.columns());

  constructor(private columnService: ColumnService) {}
}
