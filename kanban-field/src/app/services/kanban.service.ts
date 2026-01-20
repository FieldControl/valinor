import { Injectable } from '@angular/core';
import { Column, Card } from '../interfaces/kanban.interface';
import { v4 as uuidv4 } from 'uuid';
import Toast from 'typescript-toastify';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  columns: Column[] = [
    {
      id: uuidv4(),
      title: 'Backlog',
      cards: [],
    },
    {
      id: uuidv4(),
      title: 'A fazer',
      cards: [],
    },
    {
      id: uuidv4(),
      title: 'Em progresso',
      cards: [],
    },
    {
      id: uuidv4(),
      title: 'Revisão',
      cards: [],
    },
    {
      id: uuidv4(),
      title: 'Concluído',
      cards: [],
    },
  ];

  public addColumn(columnTitle: string) {
    const newColumn: Column = {
      id: uuidv4(),
      title: columnTitle,
      cards: [],
    };
    this.columns.push(newColumn);
  }

  public deleteColumn(columnId: string) {
    this.columns = this.columns.filter((col) => col.id !== columnId);
  }

  public addCard(columnId: string, title: string, cardText: string) {
    const column = this.columns.find((col) => col.id === columnId);
    if (column) {
      const newCard: Card = {
        id: uuidv4(),
        title: title,
        text: cardText,
      };
      column.cards.push(newCard);
    }
  }

  public moveCard(cardId: string, targetColumnId: string) {
    let draggedCard: Card | undefined;

    for (const col of this.columns) {
      const index = col.cards.findIndex((c) => c.id === cardId);
      if (index !== -1) {
        draggedCard = col.cards[index];
        col.cards.splice(index, 1);
        break;
      }
    }

    if (draggedCard) {
      const targetColumn = this.columns.find((col) => col.id === targetColumnId);
      if (targetColumn) {
        targetColumn.cards.push(draggedCard);
      }
    }
  }

  public deleteCard(columnId: string, cardId: string) {
    const column = this.columns.find((col) => col.id === columnId);
    if (column) {
      column.cards = column.cards.filter((card) => card.id !== cardId);
    }
  }

  public updateCard(columnId: string, cardId: string, newTitle: string, newText: string) {
    const column = this.columns.find((col) => col.id === columnId);
    if (column) {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) {
        card.title = newTitle;
        card.text = newText;
      }
    }
  }

  public createWarningToast(message: string) {
    new Toast({
      position: 'bottom-left',
      toastMsg: message,
      autoCloseTime: 3000,
      canClose: true,
      showProgress: true,
      pauseOnHover: true,
      type: 'warning',
      theme: 'light',
    });
  }
}
