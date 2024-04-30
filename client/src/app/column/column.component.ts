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
  @Output() cardRemoved = new EventEmitter<number>(); // Evento emitido quando um cartão é removido
  @Output() columnRemoved = new EventEmitter<void>(); // Evento emitido quando a coluna é removida

  // Método para remover um cartão da coluna
  removeCard(cardIndex: number) {
    const removedCard = this.cards.splice(cardIndex, 1)[0];
    this.cardRemoved.emit(cardIndex); // Emitir evento indicando que o cartão foi removido
  }

  // Método para adicionar um novo cartão à coluna
  addCard(newCardTitle: string) {
    if (newCardTitle.trim() !== '') {
      this.cards.push({ title: newCardTitle });
      this.cardMoved.emit({ card: { title: newCardTitle }, toColumnIndex: -1 }); // Emitir evento indicando que um novo cartão foi adicionado
    }
  }

  // Método para remover a coluna
  removeColumn() {
    this.columnRemoved.emit(); // Emitir evento indicando que a coluna deve ser removida
  }
}
