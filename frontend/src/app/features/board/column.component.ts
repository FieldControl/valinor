// src/app/features/board/column.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { CardComponent }                        from './card.component';
import { Column }                               from '../../shared/models/column.model';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
  ],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input() column!: Column;
  @Output() delete     = new EventEmitter<number>();
  @Output() deleteCard = new EventEmitter<number>();
  @Output() addCard    = new EventEmitter<number>();

  onDelete()       { this.delete.emit(this.column.id);     }
  onDeleteCard(id: number) { this.deleteCard.emit(id);       }
  onAddCard()      { this.addCard.emit(this.column.id);    }
}
