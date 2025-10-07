// Angular Core
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Models
import { Card } from '../../models';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <h4 class="font-medium text-gray-900 mb-1">{{ card.title }}</h4>
      <p *ngIf="card.description" class="text-sm text-gray-600 mb-2">
        {{ card.description }}
      </p>
      <div class="flex items-center justify-between">
        <span
          class="text-xs px-2 py-1 rounded-full"
          [class]="getPriorityClass(card.priority)"
        >
          {{ card.priority }}
        </span>
        <button
          (click)="onDelete()"
          class="text-gray-400 hover:text-red-500 transition-colors text-xs"
        >
          🗑️
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class CardItemComponent {
  @Input() card!: Card;
  @Output() delete = new EventEmitter<number>();

  onDelete(): void {
    this.delete.emit(this.card.id);
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
