import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() title: string = ''; // Título do cartão
  @Input() description: string = ''; // Descrição do cartão
  @Output() cardRemoved = new EventEmitter<void>(); // Evento emitido quando um cartão é removido

  // Método para remover um cartão da coluna
  removeCard() {
    this.cardRemoved.emit();
  }
}
