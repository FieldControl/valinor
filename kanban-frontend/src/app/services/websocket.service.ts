import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;
  private readonly url = 'http://localhost:3000';

  private createdColumnIds: Set<number> = new Set();
  private createdCardIds: Set<number> = new Set();

  constructor() {
    this.socket = io(this.url);
  }

  // Emissão de eventos
  createColumn(columnData: any) {
    this.createdColumnIds.add(columnData.id);
    this.socket.emit('createColumn', columnData);
  }

  createCard(cardData: any) {
    this.createdCardIds.add(cardData.id);
    this.socket.emit('createCard', cardData);
  }

  editColumn(columnData: any) {
    this.socket.emit('editColumn', columnData);
  }

  deleteColumn(columnId: number) {
    this.socket.emit('deleteColumn', columnId);
  }

  editCard(cardData: any) {
    this.socket.emit('editCard', cardData);
  }

  deleteCard(cardId: number) {
    this.socket.emit('deleteCard', cardId);
  }

  // Observáveis de criação, edição e exclusão
  onColumnCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('columnCreated', data => {
        if (!this.createdColumnIds.has(data.id)) {
          observer.next(data);
        } else {
          this.createdColumnIds.delete(data.id);
        }
      });
    });
  }

  onCardCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('cardCreated', data => {
        if (!this.createdCardIds.has(data.id)) {
          observer.next(data);
        } else {
          this.createdCardIds.delete(data.id);
        }
      });
    });
  }

  onColumnEdited(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('columnEdited', data => observer.next(data));
    });
  }

  onCardEdited(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('cardEdited', data => observer.next(data));
    });
  }

  onColumnDeleted(): Observable<number> {
    return new Observable(observer => {
      this.socket.on('columnDeleted', (columnId: number) => observer.next(columnId));
    });
  }

  onCardDeleted(): Observable<number> {
    return new Observable(observer => {
      this.socket.on('cardDeleted', (cardId: number) => observer.next(cardId));
    });
  }
}
