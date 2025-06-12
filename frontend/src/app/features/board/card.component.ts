// src/app/features/board/card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                          from '@angular/common';
import { Card }                                  from '../../shared/models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],  // para eventuais *ngIf etc
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input()  card!: Card;
  @Output() delete = new EventEmitter<number>();

  onDelete() { this.delete.emit(this.card.id); }
}
