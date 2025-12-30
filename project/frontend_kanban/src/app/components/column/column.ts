import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CardComponent } from '../card/card';
import { Card, Column } from '../../app.service';
import { FormsModule } from "@angular/forms";
import { T } from '@angular/cdk/keycodes';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, CardComponent, FormsModule],
  templateUrl: './column.html',
  styleUrls: ['./column.css']
})
export class ColumnComponent {
  @Input() column!: Column;
  
  // Eventos que essa coluna emite
  @Output() cardMoved = new EventEmitter<{event: CdkDragDrop<Card[]>, columnId: number}>();
  @Output() cardAdded = new EventEmitter<any>();
  @Output() cardDeleted = new EventEmitter<number>();
  @Output() columnDeleted = new EventEmitter<number>();

  isAddingCard = false;
  newCardTitle = '';
  newCardContent = '';

  drop(event: CdkDragDrop<Card[]>) {
    this.cardMoved.emit({ event, columnId: this.column.id });
  }

  startAddCard() {
    this.isAddingCard = true;
  }

  cancelAddCard(){
    this.isAddingCard = false;
    this.newCardContent = '';
    this.newCardTitle = '';
  }

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

  onDeleteCard(cardId: number) {
    this.cardDeleted.emit(cardId);
  }

  
  onDeleteColumn() {
    if(confirm(`Tem certeza que deseja excluir a coluna "${this.column.titulo}" e todos os cards dela?`)) {
      this.columnDeleted.emit(this.column.id);
    }
  }
}