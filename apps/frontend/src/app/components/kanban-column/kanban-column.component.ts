// Angular Core
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Models
import { Column, Card } from '../../models';
// Components
import { CardItemComponent } from '../card-item/card-item.component';
import { AddCardFormComponent } from '../add-card-form/add-card-form.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, CardItemComponent, AddCardFormComponent],
  template: `
    <div class="min-w-[300px] bg-white rounded-lg shadow-sm">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-3 h-3 rounded-full"
              [style.background-color]="column.color"
            ></div>
            <h3 class="font-semibold text-gray-900">{{ column.title }}</h3>
            <span
              class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
            >
              {{ column.cards.length }}
            </span>
          </div>
          <button
            (click)="onDelete()"
            class="text-gray-400 hover:text-red-500 transition-colors"
            title="Deletar coluna"
          >
            🗑️
          </button>
        </div>
        <p *ngIf="column.description" class="text-sm text-gray-600 mt-1">
          {{ column.description }}
        </p>
      </div>

      <div class="p-4 flex flex-col gap-3 min-h-[200px]">
        <app-card-item
          *ngFor="let card of column.cards; trackBy: trackByCardId"
          [card]="card"
          (delete)="onCardDelete($event)"
        ></app-card-item>

        <app-add-card-form
          [loading]="addingCard"
          (cardSubmit)="onCardSubmit($event)"
          (formCancel)="onCardFormCancel()"
        ></app-add-card-form>
      </div>
    </div>
  `,
  styles: [],
})
export class KanbanColumnComponent {
  @Input() column!: Column;
  @Input() addingCard = false;
  @Output() columnDelete = new EventEmitter<number>();
  @Output() cardSubmit = new EventEmitter<{
    columnId: number;
    card: {
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    };
  }>();
  @Output() cardDelete = new EventEmitter<number>();

  trackByCardId(index: number, card: Card): number {
    return card.id;
  }

  onDelete(): void {
    this.columnDelete.emit(this.column.id);
  }

  onCardSubmit(cardData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }): void {
    this.cardSubmit.emit({
      columnId: this.column.id,
      card: cardData,
    });
  }

  onCardDelete(cardId: number): void {
    this.cardDelete.emit(cardId);
  }

  onCardFormCancel(): void {
    // Handle form cancel if needed
  }
}
