import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AddCardDialogComponent } from '../add-card-dialog/add-card-dialog.component';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  @Input() title: string = ''; // Título da coluna recebido do componente pai
  @Input() cards: { title: string, description: string}[] = []; // Array para armazenar os cartões
  @Output() cardMoved = new EventEmitter<{ card: any, toColumnIndex: number }>(); // Evento emitido quando um cartão é movido
  @Output() columnRemoved = new EventEmitter<void>(); // Evento emitido quando a coluna é removida

  constructor(public dialog: MatDialog) {}

  // Método para adicionar um novo cartão à coluna
  addCard(newCardTitle: string, newCardDescription: string) {
    if (newCardTitle.trim() !== '') {
      this.cards.push({ title: newCardTitle, description: newCardDescription });
      this.cardMoved.emit({ card: { title: newCardTitle }, toColumnIndex: -1 }); // Emitir evento indicando que um novo cartão foi adicionado
    }
  }

  
  openAddCardDialog(): void {
    const dialogRef = this.dialog.open(AddCardDialogComponent, {
      width: '600px',
      data: { /* Dados que você quer passar para o diálogo */ }
    });
  
    dialogRef.componentInstance.cardAdded.subscribe(({ title, description }) => {
      this.addCard(title, description);
    });
  }

  // Método para remover a coluna
  removeColumn() {
    this.columnRemoved.emit();
  }

  // Método para remover o card
  removeCard(columnIndex: number) {
    this.cards.splice(columnIndex, 1);
  }
}
