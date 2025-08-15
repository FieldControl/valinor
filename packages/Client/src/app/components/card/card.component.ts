import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../../../services/board.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class CardComponent {
  isRenaming = false;
  newCardName = "";

  @Input() card!: Card;
  @Output() remove = new EventEmitter<void>();
  @Output() moveCardLeft = new EventEmitter<void>();
  @Output() moveCardRight = new EventEmitter<void>();
  @Output() rename = new EventEmitter<string>();

  toggleInput() {
    this.isRenaming = !this.isRenaming;
  }

  renameCard() {
    this.rename.emit(this.newCardName);
  }
}
