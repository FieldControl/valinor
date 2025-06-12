import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true }) // libera CORS por padrão
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('⚡️ EventsGateway initialized');
  }

  emit(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
