import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl);
  }

  onCardCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('cardCreated', (card) => {
        observer.next(card);
      });
    });
  }

  onCardUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('cardUpdated', (card) => {
        observer.next(card);
      });
    });
  }

  onCardDeleted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('cardDeleted', (cardId) => {
        observer.next(cardId);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
