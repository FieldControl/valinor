import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() title: string = ''; // Título do cartão
  @Input() description: string = ''; // Descrição do cartão
  @Output() cardRemoved = new EventEmitter<void>(); // Evento emitido quando um cartão é removido

  constructor(public dialog: MatDialog) {}

  openCardDialog(): void {
    const dialogRef = this.dialog.open(CardDialogComponent, {
      width: '600px',
      data: { title: this.title, description: this.description }
    });
  
    dialogRef.componentInstance.cardDeleted.subscribe(() => {
      this.cardRemoved.emit();
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('O diálogo foi fechado');
      // Faça algo quando o diálogo for fechado
    });
  }

  // Método para remover um cartão da coluna
  removeCard() {
    this.cardRemoved.emit();
  }
}
