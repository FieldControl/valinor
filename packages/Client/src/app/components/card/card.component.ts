import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '../../../services/board.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  @Input() card!: Card;
  @Output() remove = new EventEmitter<void>();
  @Output() moveCardLeft = new EventEmitter<void>();
  @Output() moveCardRight = new EventEmitter<void>();
  @Output() rename = new EventEmitter<void>();
}
