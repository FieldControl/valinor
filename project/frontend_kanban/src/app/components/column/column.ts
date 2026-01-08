import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CardComponent } from '../card/card';
import { Card, Column } from '../../app.service';
import { FormsModule } from "@angular/forms";


@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, CardComponent, FormsModule],
  templateUrl: './column.html',
  styleUrls: ['./column.css']
})
export class ColumnComponent {
  @Input() column!: Column;
  
  // Eventos emitidos para o componente pai (App)
  @Output() cardMoved = new EventEmitter<{event: CdkDragDrop<Card[]>, columnId: number}>();
  @Output() cardAdded = new EventEmitter<any>(); // TODO: tipar melhor o payload
  @Output() cardDeleted = new EventEmitter<number>();
  @Output() columnDeleted = new EventEmitter<number>();

  isAddingCard = false;
  newCardTitle = '';
  newCardContent = '';

  // Emite evento ao soltar um card (drag-drop)
  drop(event: CdkDragDrop<Card[]>) {
    this.cardMoved.emit({ event, columnId: this.column.id });
  }

  // Inicia fluxo de criação de card (mostra formulário)
  startAddCard() {
    this.isAddingCard = true;
  }

  // Cancela criação de card e limpa campos
  cancelAddCard(){
    this.isAddingCard = false;
    this.newCardContent = '';
    this.newCardTitle = '';
  }

  // Emite evento informando os dados do novo card
  confirmAddCard(){
    if(!this.newCardTitle.trim()) return;

   const dados = {
    titulo: this.newCardTitle,
    conteudo: this.newCardContent,
    colunaID: this.column.id
   }
   console.log(dados)
   this.cardAdded.emit(dados)
    this.cancelAddCard()
  }

  // Emite evento para deletar card no parent
  onDeleteCard(cardId: number) {
    this.cardDeleted.emit(cardId);
  }

  // Confirma e emite evento para deletar a coluna
  onDeleteColumn() {
    if(confirm(`Tem certeza que deseja excluir a coluna "${this.column.titulo}" e todos os cards dela?`)) {
      this.columnDeleted.emit(this.column.id);
    }
  }
}