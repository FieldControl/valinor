// src/app/features/board/board.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { DummyService }      from './dummy.service';
import { Column }            from '../../shared/models/column.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(private ds: DummyService) {}

  ngOnInit() {
    this.columns = this.ds.getColumns();
    console.log('colunas:', this.columns);
  }

  onDeleteColumn(id: number) {
    this.columns = this.columns.filter(c => c.id !== id);
  }

  onDeleteCard(id: number) {
    this.columns.forEach(c =>
      c.cards = c.cards.filter(card => card.id !== id)
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
