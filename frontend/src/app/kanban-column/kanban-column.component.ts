import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Column } from '../models/column.model';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, KanbanCardComponent],
  template: `
    <div class="kanban-column">
      <h2>{{ column.name }}</h2>
      <app-kanban-card *ngFor="let card of column.cards" [card]="card">
      </app-kanban-card>
    </div>
  `,
  styles: [
    `
      .kanban-column {
        border: 1px solid #ccc;
        padding: 16px;
        border-radius: 4px;
        width: 300px;
      }
    `,
  ],
})
export class KanbanColumnComponent {
  @Input() column!: Column;
}
