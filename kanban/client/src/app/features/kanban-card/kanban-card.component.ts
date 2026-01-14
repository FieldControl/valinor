import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../../core/models/card.model';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [
    CommonModule,

    // Material
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './kanban-card.component.html',
  styleUrls: ['./kanban-card.component.scss'],
})
export class KanbanCardComponent {
  @Input() card!: Card;

  @Output() open = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();


  onOpenCard(): void {
    this.open.emit();
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit();
  }
}
