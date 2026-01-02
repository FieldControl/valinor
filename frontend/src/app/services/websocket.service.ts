import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment.development';
import * as Ably from 'ably';
@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;
  // private client: Ably.RealtimeClient;
  // private channel: Ably.RealtimeChannel;
  // private readonly CHANNEL_NAME = 'kanban-board';

  constructor() {
    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    //Ably Realtime Client

    // this.client = new Ably.Realtime({
    //   key: environment.ablyKey,
    //   autoConnect: true,
    // });
    // this.channel = this.client.channels.get(this.CHANNEL_NAME);

    // this.client.connection.on('connected', () => {
    //   console.log('Conectado ao Ably server');
    // });

    // this.client.connection.on('disconnected', () => {
    //   console.log('Disconectado do Ably server');
    // });

    // this.client.connection.on('failed', (error) => {
    //   console.error('Conecção falhou:', error);
    // });
  }

  on<T>(event: string): Observable<T> {
    return fromEvent<T>(this.socket, event);
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }

  connect() {
    if (this.socket) this.socket.connect();
  }

  // Ably Realtime Client
  // on<T>(event: string): Observable<T> {
  //   return new Observable<T>((observer) => {
  //     const callback = (message: Ably.Message) => {
  //       observer.next(message.data as T);
  //     };

  //     this.channel.subscribe(event, callback);
  //     return () => {
  //       this.channel.unsubscribe(event, callback);
  //     };
  //   });
  // }

  // async emit(event: string, data: any) {
  //   await this.channel.publish(event, data);
  // }

  // disconnect() {
  //   if (this.client) this.client.close();
  // }

  // connect() {
  //   if (this.client && this.client.connection.state === 'closed') this.client.connect();
  // }
}
