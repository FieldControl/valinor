// src/app/features/column/column.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { FormsModule }                            from '@angular/forms';
import { Column }                                 from '../../shared/models/column.model';
import { Card }                                   from '../../shared/models/card.model';
import { ColumnsApiService }                      from '../../core/api/columns-api.service';
import { CardsApiService }                        from '../../core/api/cards-api.service';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule         // ← para o input do novo card
  ],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input()  column!: Column;
  @Output() deleted     = new EventEmitter<void>();
  @Output() cardAdded   = new EventEmitter<void>();
  @Output() cardDeleted = new EventEmitter<void>();
  @Output() cardMoved   = new EventEmitter<void>();

  newCardTitle = '';
  addingCard = false;

  constructor(
    private colsApi: ColumnsApiService,
    private cardsApi: CardsApiService,
  ) {}

  onDelete() {
    this.colsApi.delete(this.column.id)
      .subscribe(() => this.deleted.emit());
  }

  startAddCard() {
    this.addingCard = true;
    this.newCardTitle = '';
  }

  cancelAddCard() {
    this.addingCard = false;
    this.newCardTitle = '';
  }

  confirmAddCard() {
    const title = this.newCardTitle.trim();
    if (!title) return;
    const dto = {
      title,
      order: this.column.cards.length,
      columnId: this.column.id
    };
    this.cardsApi.create(dto)
      .subscribe(() => {
        this.cardAdded.emit();
        this.cancelAddCard();
      });
  }

  onDeleteCard(cardId: number) {
    this.cardsApi.delete(cardId)
      .subscribe(() => this.cardDeleted.emit());
  }

  onMoveCard(card: Card, targetColId: number, newOrder: number) {
    this.cardsApi.move(card.id, targetColId, newOrder)
      .subscribe(() => this.cardMoved.emit());
  }
}
