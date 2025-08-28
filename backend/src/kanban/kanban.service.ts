import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Card, Column } from './kanban.types';

@Injectable()
export class KanbanService {
  private columns: Column[] = [
    { id: 'fazer',  name: 'Fazer',  cards: [] },
    { id: 'fazendo', name: 'Fazendo',  cards: [] },
    { id: 'feito', name: 'feito',  cards: [] },
  ]

  getColumns(): Column[] {
    return this.columns;
  }

  createCard(columnId: string, title: string): Card {
    const col = this.columns.find(c => c.id === columnId);
    if (!col) throw new Error('coluna nao encontrada');

    const card: Card = { id: randomUUID(), title };
    col.cards.push(card);
    return card;
  }

  moveCard(cardId: string, toColumnId: string, newIndex?: number): boolean {
  const fromCol = this.columns.find(c => c.cards.some(x => x.id === cardId));
  const toCol   = this.columns.find(c => c.id === toColumnId);

  if (!fromCol || !toCol) throw new Error('coluna ou card nao encontrado');

  const i = fromCol.cards.findIndex(x => x.id === cardId);
  const [card] = fromCol.cards.splice(i, 1);


  let insertAt = toCol.cards.length;
  if (newIndex !== undefined) {
    insertAt = Math.max(0, Math.min(newIndex, toCol.cards.length));
  }

  toCol.cards.splice(insertAt, 0, card);
  return true;
}

}
