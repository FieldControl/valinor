import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface JoinBoardData {
  boardId: string;
}

interface BoardUpdateData {
  boardId: string;
  type: 'board' | 'column' | 'card';
  action: 'create' | 'update' | 'delete' | 'move';
  data: any;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('RealtimeGateway');

  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinBoardData,
  ): void {
    const { boardId } = data;
    client.join(`board:${boardId}`);
    this.logger.log(`Client ${client.id} joined board ${boardId}`);
    
    client.emit('joinedBoard', { boardId });
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinBoardData,
  ): void {
    const { boardId } = data;
    client.leave(`board:${boardId}`);
    this.logger.log(`Client ${client.id} left board ${boardId}`);
    
    client.emit('leftBoard', { boardId });
  }

  // Method to broadcast updates to all clients in a board room
  broadcastBoardUpdate(boardId: string, updateData: BoardUpdateData): void {
    this.server.to(`board:${boardId}`).emit('boardUpdate', updateData);
    this.logger.log(`Broadcasting update to board ${boardId}:`, updateData);
  }

  // Method to broadcast card movements
  broadcastCardMove(boardId: string, cardId: string, fromColumnId: string, toColumnId: string, newPosition: number): void {
    const updateData: BoardUpdateData = {
      boardId,
      type: 'card',
      action: 'move',
      data: {
        cardId,
        fromColumnId,
        toColumnId,
        newPosition,
      },
    };
    
    this.broadcastBoardUpdate(boardId, updateData);
  }

  // Method to broadcast column movements
  broadcastColumnMove(boardId: string, columnId: string, newPosition: number): void {
    const updateData: BoardUpdateData = {
      boardId,
      type: 'column',
      action: 'move',
      data: {
        columnId,
        newPosition,
      },
    };
    
    this.broadcastBoardUpdate(boardId, updateData);
  }

  // Method to broadcast general entity updates
  broadcastEntityUpdate(
    boardId: string,
    type: 'board' | 'column' | 'card',
    action: 'create' | 'update' | 'delete',
    data: any,
  ): void {
    const updateData: BoardUpdateData = {
      boardId,
      type,
      action,
      data,
    };
    
    this.broadcastBoardUpdate(boardId, updateData);
  }
}