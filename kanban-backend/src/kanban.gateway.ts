import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class KanbanGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createColumn')
  handleCreateColumn(@MessageBody() columnData: any) {
    // Lógica de criação de coluna
    this.server.emit('columnCreated', columnData); // Emite o evento para todos os clientes conectados
  }

  @SubscribeMessage('editColumn')
  handleEditColumn(@MessageBody() columnData: any) {
    // Lógica de edição de coluna
    this.server.emit('columnEdited', columnData);
  }

  @SubscribeMessage('deleteColumn')
  handleDeleteColumn(@MessageBody() columnId: string) {
    // Lógica de exclusão de coluna
    this.server.emit('columnDeleted', columnId);
  }

  @SubscribeMessage('createCard')
  handleCreateCard(@MessageBody() cardData: any) {
    // Lógica de criação de card
    this.server.emit('cardCreated', cardData);
  }

  @SubscribeMessage('editCard')
  handleEditCard(@MessageBody() cardData: any) {
    // Lógica de edição de card
    this.server.emit('cardEdited', cardData);
  }

  @SubscribeMessage('deleteCard')
  handleDeleteCard(@MessageBody() cardId: string) {
    // Lógica de exclusão de card
    this.server.emit('cardDeleted', cardId);
  }
}
