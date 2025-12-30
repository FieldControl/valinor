import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { FormsModule } from '@angular/forms'

import { ApiService, Column, Card } from "./app.service";
import { ColumnComponent } from "./components/column/column";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    HttpClientModule,
    FormsModule,
    ColumnComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App implements OnInit {
  columns: Column[] = [];
  isAddingColumn = false;
  newColumnTitle = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadBoard();
  }

  loadBoard() {
    this.api.getColumn().subscribe({
      next: (data) => {
        this.columns = data;
        console.log('Board carregado:', this.columns);
      },
      error: (err) => console.log('erro ao carregar board:', err)
    });
  }

  startAddColumn() {
    this.isAddingColumn = true
  }
  cancelAddColumn() {
    this.isAddingColumn = false;
    this.newColumnTitle = '';
  }

  confirmAddColumn() {
    if (!this.newColumnTitle.trim()) return;

    this.api.createColumn(this.newColumnTitle).subscribe(() => {
      this.loadBoard();
      this.cancelAddColumn()
    });
  }

  handleColumnDeleted(colunaID: number) {
    this.api.deleteColumn(colunaID).subscribe(() => {
      this.columns = this.columns.filter(c => c.id !== colunaID)
    });
  }

  handleCardAdded(event: {titulo: string, conteudo: string, colunaID: number}) {

    console.log(event)
    this.api.createCard(event.titulo, event.conteudo, event.colunaID).subscribe(newCard => {
      const col = this.columns.find(c => c.id === event.colunaID);
      if (col) {
        if (!col.cards) col.cards = [];
        col.cards.push(newCard);
      }
    });
  }

  handleCardDeleted(cardID: number, colunaID: number) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.api.deleteCard(cardID).subscribe(() => {
        const col = this.columns.find(c => c.id === colunaID);
        if (col) {
          col.cards = col.cards.filter(c => c.id !== cardID);
        }
        this.loadBoard()
      });
    }
  }

  handleCardMove(wrapper: { event: CdkDragDrop<Card[]>, columnId: number }) {
    const { event, columnId } = wrapper; // <--- Ajuste aqui também

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const card = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Ajuste a chamada aqui também
      this.api.moveCard(card.id, columnId).subscribe({
        error: (err) => console.error('Erro ao mover', err)
      });
    }
  }
}