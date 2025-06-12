import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../card/card';
import { ColumnModel } from '../../models/column.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-column',
  imports: [CommonModule, Card],
  standalone: true,
  templateUrl: './column.html',
  styleUrl: './column.scss'
})
export class Column {
  @Input() column!: ColumnModel
  @Input() columns: ColumnModel[] = []
  @Output() onAddCard = new EventEmitter<{columnId: string, content: string}>()
  @Output() onEditCard = new EventEmitter<{cardId: string, content: string}>()
  @Output() onMoveCard = new EventEmitter<{cardId: string, newColumnId: string}>()
  @Output() onDeleteCard = new EventEmitter<string>()


  addCard(content: string) {
    this.onAddCard.emit({
      columnId: this.column.id,
      content: content
    })
  }

  editCard(cardId: string, content: string) {
    this.onEditCard.emit({
      cardId: cardId,
      content: content
    })
  }

  moveCard(cardId: string, newColumnId: string) {
    this.onMoveCard.emit({
      cardId,
      newColumnId
    })
  }

  deleteCard(cardId: string) {
    this.onDeleteCard.emit(cardId)
  }
}
