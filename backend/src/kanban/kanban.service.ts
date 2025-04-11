/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Kanban } from './kanban.model';

@Injectable()
export class KanbanService {
  private kanbans: Kanban[] = [
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'In Progress', cards: [] },
    { id: 3, title: 'Done', cards: [] }
  ];

  private cards: { id: string; title: string; description: string; columnId: string }[] = []; // Simulação de armazenamento em memória

  // Retorna todas as colunas
  getColumns(): Kanban[] {
    return this.kanbans;
  }

  // Cria uma nova coluna
  createColumn(column: Kanban): Kanban {
    this.kanbans.push(column);
    import { Injectable } from '@nestjs/common';
import { Kanban } from './kanban.model';

@Injectable()
export class KanbanService {
  private kanbans: Kanban[] = [
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'In Progress', cards: [] },
    { id: 3, title: 'Done', cards: [] }
  ];

  private cards: { id: string; title: string; description: string; columnId: string }[] = [];

  getColumns(): Kanban[] {
    return this.kanbans;
  }

  createColumn(column: Kanban): Kanban {
    this.kanbans.push(column);
    return column;
  }

  updateColumn(id: number, updatedColumn: Partial<Kanban>): Kanban | null {
    const columnIndex = this.kanbans.findIndex((column) => column.id === id);
    if (columnIndex > -1) {
      this.kanbans[columnIndex] = { ...this.kanbans[columnIndex], ...updatedColumn };
      return this.kanbans[columnIndex];
    }
    return null;
  }

  addCardToColumn(columnId: number, item: string): Kanban | null {
    const column = this.kanbans.find((col) => col.id === columnId);
    if (column) {
      column.cards.push(item);
      return column;
    }
    return null;
  }

  moveCard(card: string, fromColumnId: number, toColumnId: number): Kanban | null {
    const fromColumn = this.kanbans.find((col) => col.id === fromColumnId);
    const toColumn = this.kanbans.find((col) => col.id === toColumnId);

    if (fromColumn && toColumn) {
      const cardIndex = fromColumn.cards.indexOf(card);
      if (cardIndex > -1) {
        fromColumn.cards.splice(cardIndex, 1);
        toColumn.cards.push(card);
        return toColumn;
      }
    }
    return null;
  }

  getAllKanbans(): Kanban[] {
    return this.kanbans;
  }

  createKanban(kanban: Kanban): Kanban {
    this.kanbans.push(kanban);
    return kanban;
  }

  update(id: number, updatedKanban: Partial<Kanban>): Kanban | null {
    const kanbanIndex = this.kanbans.findIndex((kanban) => kanban.id === id);
    if (kanbanIndex > -1) {
      this.kanbans[kanbanIndex] = { ...this.kanbans[kanbanIndex], ...updatedKanban };
      return this.kanbans[kanbanIndex];
    }
    return null;
  }

  remove(id: number): Kanban | null {
    const kanbanIndex = this.kanbans.findIndex((kanban) => kanban.id === id);
    if (kanbanIndex > -1) {
      const [removedKanban] = this.kanbans.splice(kanbanIndex, 1);
      return removedKanban;
    }
    return null;
  }

  addCard(cardData: { title: string; description: string; columnId: string }) {
    const newCard = {

  // Atualiza uma coluna existente
  updateColumn(id: number, updatedColumn: Partial<Kanban>): Kanban | null {
    const columnIndex = this.kanbans.findIndex((column) => column.id === id);
    if (columnIndex > -1) {
      this.kanbans[columnIndex] = { ...this.kanbans[columnIndex], ...updatedColumn };
      return this.kanbans[columnIndex];
    }
    return null;
  }

  // Adiciona um card a uma coluna
  addCardToColumn(columnId: number, item: string): Kanban | null {
    const column = this.kanbans.find((col) => col.id === columnId);
    if (column) {
      column.cards.push(item); // Adiciona o item ao array de cards da coluna
      return column;
    }
    return null; // Retorna null se a coluna não for encontrada
  }

  // Move um card de uma coluna para outra
  moveCard(card: string, fromColumnId: number, toColumnId: number): Kanban | null {
    const fromColumn = this.kanbans.find((col) => col.id === fromColumnId);
    const toColumn = this.kanbans.find((col) => col.id === toColumnId);

    if (fromColumn && toColumn) {
      const cardIndex = fromColumn.cards.indexOf(card);
      if (cardIndex > -1) {
      fromColumn.cards.splice(cardIndex, 1);
      toColumn.cards.push(card);
      return toColumn;
      }
    }
    return null;
  }

  // Retorna todos os kanbans
  getAllKanbans(): Kanban[] {
    return this.kanbans;
  }

  // Cria um novo kanban
  createKanban(kanban: Kanban): Kanban {
    this.kanbans.push(kanban);
    return kanban;
  }

  // Atualiza um kanban
  update(id: number, updatedKanban: Partial<Kanban>): Kanban | null {
    const kanbanIndex = this.kanbans.findIndex((kanban) => kanban.id === id);
    if (kanbanIndex > -1) {
      this.kanbans[kanbanIndex] = { ...this.kanbans[kanbanIndex], ...updatedKanban };
      return this.kanbans[kanbanIndex];
    }
    return null;
  }

  // Remove um kanban
  remove(id: number): Kanban | null {
    const kanbanIndex = this.kanbans.findIndex((kanban) => kanban.id === id);
    if (kanbanIndex > -1) {
      const [removedKanban] = this.kanbans.splice(kanbanIndex, 1);
      return removedKanban;
    }
    return null;
  }

  addCard(cardData: { title: string; description: string; columnId: string }) {
    const newCard = {
      id: Date.now().toString(),
      title: cardData.title,
      description: cardData.description,
      columnId: cardData.columnId,
    };

    this.cards.push(newCard);
    return newCard;
  }
}
