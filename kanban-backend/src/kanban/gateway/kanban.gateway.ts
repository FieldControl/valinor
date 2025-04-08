import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CardModel } from '../graphql/models/card.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class KanbanGateway {
  @WebSocketServer()
  server: Server;

  emitCardCreated(card: CardModel) {
    this.server.emit('cardCreated', card);
  }

  emitCardUpdated(card: CardModel) {
    this.server.emit('cardUpdated', card);
  }

  emitCardDeleted(cardId: number) {
    this.server.emit('cardDeleted', cardId);
  }
}
