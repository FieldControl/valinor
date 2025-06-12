import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  transferArrayItem
}                             from '@angular/cdk/drag-drop';
import { DummyService }       from './dummy.service';
import { Column }             from '../../shared/models/column.model';
import { Card }               from '../../shared/models/card.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(private ds: DummyService) {}

  ngOnInit() {
    this.columns = this.ds.getColumns();
  }

  // retorna array de IDs de todas as drop lists
  get connectedTo(): string[] {
    return this.columns.map(c => `col-${c.id}`);
  }

  drop(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) return;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
  }

  onDeleteColumn(colId: number) {
    this.columns = this.columns.filter(c => c.id !== colId);
  }

  onDeleteCard(cardId: number) {
    this.columns.forEach(c =>
      (c.cards = c.cards.filter(card => card.id !== cardId))
    );
  }

  addColumn() {
    const newId = Math.max(0, ...this.columns.map(c => c.id)) + 1;
    this.columns.push({
      id: newId,
      title: 'Nova Coluna',
      order: this.columns.length,
      cards: [],
    });
  }

  onAddCard(columnId: number) {
    const col = this.columns.find(c => c.id === columnId)!;
    const newCardId =
      Math.max(0, ...this.columns.flatMap(c => c.cards.map(card => card.id))) + 1;
    col.cards.push({
      id: newCardId,
      title: 'Novo Card',
      description: '',
      order: col.cards.length,
      columnId,
    });
  }
}
