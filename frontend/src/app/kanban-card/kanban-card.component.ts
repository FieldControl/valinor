import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../models/card.model';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kanban-card">
      <h3>{{ card.title }}</h3>
      <p>{{ card.description }}</p>
    </div>
  `,
  styles: [
    `
      .kanban-card {
        padding: 12px;
        margin-bottom: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
      }
    `,
  ],
})
export class KanbanCardComponent {
  @Input() card!: Card;
}
