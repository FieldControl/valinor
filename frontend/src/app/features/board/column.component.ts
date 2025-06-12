import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                           from '@angular/common';

import { ColumnsApiService }      from '../../core/api/columns-api.service';
import { CardsApiService }        from '../../core/api/cards-api.service';
import { Column }                 from '../../shared/models/column.model';
import { Card }                   from '../../shared/models/card.model';
import { CardComponent }          from './card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input()  column!: Column;
  @Output() deleted     = new EventEmitter<void>();
  @Output() cardAdded   = new EventEmitter<void>();
  @Output() cardDeleted = new EventEmitter<void>();
  @Output() cardMoved   = new EventEmitter<void>();

  constructor(
    private colsApi: ColumnsApiService,
    private cardsApi: CardsApiService,
  ) {}

  onDelete() {
    this.colsApi.delete(this.column.id)
      .subscribe(() => this.deleted.emit());
  }

  onAddCard() {
    const dto = {
      title: 'Novo Card',
      order: this.column.cards.length,
      columnId: this.column.id,
    };
    this.cardsApi.create(dto)
      .subscribe(() => this.cardAdded.emit());
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
