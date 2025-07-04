import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardModel } from '../../models/kanban.model';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css'
})
export class Card {
  @Input() cardModel!: CardModel;
  @Output() cardClicked = new EventEmitter<CardModel>();

  onClick(): void {
    this.cardClicked.emit(this.cardModel);
  }
}
