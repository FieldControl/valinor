import { Injectable } from '@angular/core';
import { Column, Card } from '../../shared/models/column.model';

@Injectable({ providedIn: 'root' })
export class DummyService {
  private data: Column[] = [
    { id: 1, title: 'Todo', order: 0, cards: [
      { id: 1, title: 'Tarefa A', order: 0 },
      { id: 2, title: 'Tarefa B', order: 1 },
    ]},
    { id: 2, title: 'Doing', order: 1, cards: [] },
    { id: 3, title: 'Done', order: 2, cards: [] },
  ];

  getColumns(): Column[] {
    return this.data;
  }
}
