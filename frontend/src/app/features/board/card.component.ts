import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { Card }                                   from '../../shared/models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span>{{card.title}}</span>
    <button class="delete-btn" (click)="delete.emit(card.id)">×</button>
  `,
  styles: [`
    :host { display:flex; justify-content:space-between; }
    .delete-btn { background:none; border:none; cursor:pointer; color:#c00; }
  `]
})
export class CardComponent {
  @Input()  card!: Card;
  @Output() delete = new EventEmitter<number>();
}
