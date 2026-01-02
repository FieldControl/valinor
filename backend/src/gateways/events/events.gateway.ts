import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('Gateway inicializado');
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}
