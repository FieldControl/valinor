import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { AddCardDialogComponent } from '../add-card-dialog/add-card-dialog.component';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  @Input() title: string = '';
  @Input() cards: { title: string, description: string }[] = [];
  @Output() columnRemoved = new EventEmitter<void>();
  @Output() cardMoved = new EventEmitter<any>();
  @Output() cardRemoved = new EventEmitter<number>();

  constructor(public dialog: MatDialog) { }

  // Método para adicionar um novo cartão à coluna
  addCard(newCardTitle: string, newCardDescription: string) {
    if (newCardTitle.trim() !== '') {
      this.cards.push({ title: newCardTitle, description: newCardDescription });
      this.cardMoved.emit({ card: { title: newCardTitle }, toColumnIndex: -1 }); // Emitir evento indicando que um novo cartão foi adicionado
    }
  }

  // Método para lidar com o evento de soltar um cartão
  dropCard(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

  // Método para remover a coluna
  removeColumn() {
    this.columnRemoved.emit();
  }

  // Método para remover um cartão
  removeCard(index: number) { // Adicione este método
    this.cards.splice(index, 1);
    this.cardRemoved.emit(index);
  }

  // Método para abrir o diálogo de adicionar cartão
  openAddCardDialog() {
    const dialogRef = this.dialog.open(AddCardDialogComponent, {
      width: '600px',
      data: { title: '', description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addCard(result.title, result.description);
      }
    });
  }
}