import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardComponent } from "../card/card.component";
import { CommonModule } from '@angular/common';
import { Card } from '../../../services/board.service';


@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  imports: [CardComponent, CommonModule]
})
export class ColumnComponent {
  @Input() title!: string;
  @Input() cards: Card[] = [];

  @Output() remove = new EventEmitter<void>();
  @Output() moveLeft = new EventEmitter<void>();
  @Output() moveRight = new EventEmitter<void>();
  @Output() rename = new EventEmitter<void>();
  @Output() createCard = new EventEmitter<void>();

  @Output() removeCard = new EventEmitter<number>();
  @Output() moveCardLeft = new EventEmitter<number>();
  @Output() moveCardRight = new EventEmitter<number>();
  @Output() renameCard = new EventEmitter<number>();

}
