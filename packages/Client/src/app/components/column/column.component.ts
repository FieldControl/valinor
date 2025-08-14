import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CardComponent } from "../card/card.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
  imports: [CardComponent, CommonModule]
})
export class ColumnComponent {
  @Input() titulo!: string;
  @Input() cards: string[] = [];

  @Output() remover = new EventEmitter<void>();
  @Output() moverEsquerda = new EventEmitter<void>();
  @Output() moverDireita = new EventEmitter<void>();
  @Output() renomear = new EventEmitter<void>();
  @Output() criarCard = new EventEmitter<void>();

  @Output() removerCard = new EventEmitter<number>();
  @Output() moverCardEsquerda = new EventEmitter<number>();
  @Output() moverCardDireita = new EventEmitter<number>();
  @Output() renomearCard = new EventEmitter<number>();

  
}
