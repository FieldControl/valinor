import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  @Input() title: string = ''; // Título da coluna recebido do componente pai
  @Input() cards: { title: string }[] = []; // Array para armazenar os cartões
  @Output() cardMoved = new EventEmitter<{ card: any, toColumnIndex: number }>(); // Evento emitido quando um cartão é movido

  // Método para remover um cartão da coluna
  removeCard(cardIndex: number) {
    const removedCard = this.cards.splice(cardIndex, 1)[0];
    this.cardMoved.emit({ card: removedCard, toColumnIndex: -1 }); // Emitir evento indicando que o cartão foi removido
  }

  // Método para adicionar um novo cartão à coluna
  addCard(newCardTitle: string) {
    if (newCardTitle.trim() !== '') {
      this.cards.push({ title: newCardTitle });
    }
  }
}
