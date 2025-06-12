// src/app/features/board/card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { Card }            from '../../shared/models/column.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() card!: Card;
}
