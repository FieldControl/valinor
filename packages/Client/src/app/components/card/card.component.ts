import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() texto!: string;
  @Output() remover = new EventEmitter<void>();
  @Output() moverEsquerda = new EventEmitter<void>();
  @Output() moverDireita = new EventEmitter<void>();
  @Output() renomear = new EventEmitter<void>();
}
