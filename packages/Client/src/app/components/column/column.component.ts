import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardComponent } from "../card/card.component";
import { CommonModule } from '@angular/common';
import { Card } from '../../../services/board.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  imports: [CardComponent, CommonModule, FormsModule]
})
export class ColumnComponent {
  isRenaming = false;
  newColumnName = "";

  @Input() title!: string;
  @Input() cards: Card[] = [];

  @Output() remove = new EventEmitter<void>();
  @Output() moveLeft = new EventEmitter<void>();
  @Output() moveRight = new EventEmitter<void>();
  @Output() rename = new EventEmitter<string>();
  @Output() createCard = new EventEmitter<void>();

  @Output() removeCard = new EventEmitter<number>();
  @Output() moveCardLeft = new EventEmitter<number>();
  @Output() moveCardRight = new EventEmitter<number>();
  @Output() renameCard = new EventEmitter<{ index: number, name: string }>();

  emitRenameCard(index: number, name: string) {
    this.renameCard.emit({ index, name })
  }

  toggleInput() {
    this.isRenaming = !this.isRenaming;
  }

  renameColumn() {
    this.rename.emit(this.newColumnName);
  }

}
