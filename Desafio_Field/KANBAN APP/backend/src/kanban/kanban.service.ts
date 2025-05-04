// backend/src/kanban/kanban.service.ts
import { Injectable } from '@nestjs/common';
import { Column } from './column.model';
import { Card } from './card.model';

@Injectable()
export class KanbanService {
  private columns: Column[] = [
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'In Progress', cards: [] }
  ];

  getColumns(): Column[] {
    return this.columns;
  }

  createCard(content: string, columnId: number): Card {
    const card: Card = { id: Date.now(), content, column: columnId };
    const column = this.columns.find(col => col.id === columnId);
    if (column) {
      column.cards.push(card);
    }
    return card;
  }
}
