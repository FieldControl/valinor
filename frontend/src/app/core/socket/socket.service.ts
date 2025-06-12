import { Injectable }        from '@angular/core';
import { io, Socket }        from 'socket.io-client';
import { fromEvent, Observable } from 'rxjs';

// Ajuste para sua URL de API + WS (do environment)
const WS_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(WS_URL, {
      transports: ['websocket'],
    });
  }

  /** Observable que emite quando qualquer evento chega */
  on<T>(eventName: string): Observable<T> {
    return fromEvent<T>(this.socket, eventName);
  }

  /** emitir do front (se precisar) */
  emit(eventName: string, payload: any) {
    this.socket.emit(eventName, payload);
  }
}
