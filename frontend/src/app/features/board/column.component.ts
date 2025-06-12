// src/app/features/board/column.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { FormsModule }                            from '@angular/forms';
import {
  DragDropModule,
  CdkDragDrop,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Column }                                 from '../../shared/models/column.model';
import { ColumnsApiService }                      from '../../core/api/columns-api.service';
import { CardsApiService }                        from '../../core/api/cards-api.service';
import { CardComponent }                          from './card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    CardComponent
  ],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input()  column!: Column;
  @Input()  connectedTo: string[] = [];
  @Output() deleted     = new EventEmitter<void>();
  @Output() cardAdded   = new EventEmitter<void>();
  @Output() cardDeleted = new EventEmitter<void>();
  @Output() cardMoved   = new EventEmitter<void>();

  newCardTitle = '';
  addingCard   = false;

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
      columnId: this.column.id,
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

  /** Tratamento do drop */
  drop(event: CdkDragDrop<Column['cards']>) {
    if (event.previousContainer === event.container) return;

    // 1) Atualiza lista local
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    // 2) Persiste no back
    const movedCard = event.container.data[event.currentIndex];
    this.cardsApi
      .move(movedCard.id, this.column.id, event.currentIndex)
      .subscribe(() => this.cardMoved.emit());
  }
}
