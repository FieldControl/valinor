// src/app/features/board/dummy.service.ts
import { Injectable } from '@angular/core';
import { Column }     from '../../shared/models/column.model';

@Injectable({ providedIn: 'root' })
export class DummyService {
  getColumns(): Column[] {
    return [
      {
        id: 1,
        title: 'Todo',
        order: 0,
        cards: [
          { id: 1, title: 'Tarefa A', description: '', order: 0, columnId: 1 },
          { id: 2, title: 'Tarefa B', description: '', order: 1, columnId: 1 },
        ],
      },
      { id: 2, title: 'Doing', order: 1, cards: [] },
      { id: 3, title: 'Done', order: 2, cards: [] },
    ];
  }
}
