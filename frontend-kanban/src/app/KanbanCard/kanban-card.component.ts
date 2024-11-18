import { Component, Input } from '@angular/core';
import { Card } from '../models/card.model';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  templateUrl: './kanban-card.component.html',
  styleUrls: ['./kanban-card.component.scss'],
  imports: [CommonModule, MatCardModule],
})
export class KanbanCardComponent {
  @Input()
  card!: Card;
}
