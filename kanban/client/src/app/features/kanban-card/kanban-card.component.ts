import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Card } from '../../core/models/card.model';

// Angular Material
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [
    CommonModule,
    
    // Material
    MatCardModule],
  templateUrl: './kanban-card.component.html',
  styleUrls: ['./kanban-card.component.scss'],
})
export class KanbanCardComponent {
  @Input() card!: Card;
}
