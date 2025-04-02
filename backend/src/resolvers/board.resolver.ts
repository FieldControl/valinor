import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql';
import { BoardService } from '../services/board.service';
import { Board, BoardInput, Column, ColumnInput, Card, CardInput, Tag, TagInput, Attachment, AttachmentInput, ColumnUpdateInput } from '../types/schema';
import { Context } from '../types/context';

@Resolver()
export class BoardResolver {
  private boardService: BoardService;

  constructor() {
    this.boardService = new BoardService();
  }

  @Query(() => Board, { nullable: true })
  async board(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<Board | null> {
    const userId = ctx.user?.uid;
    return this.boardService.getBoard(id, userId);
  }

  @Query(() => [Board])
  async boards(
    @Ctx() ctx: Context
  ): Promise<Board[]> {
    const userId = ctx.user?.uid;
    return this.boardService.getBoards(userId);
  }

  @Mutation(() => Board)
  async createBoard(
    @Arg('input') input: BoardInput,
    @Ctx() ctx: Context
  ): Promise<Board> {
    const userId = ctx.user?.uid;
    return this.boardService.createBoard(input, userId);
  }

  @Mutation(() => Board)
  async updateBoard(
    @Arg('id') id: string,
    @Arg('input') input: BoardInput,
    @Ctx() ctx: Context
  ): Promise<Board> {
    const userId = ctx.user?.uid;
    return this.boardService.updateBoard(id, input, userId);
  }

  @Mutation(() => Boolean)
  async deleteBoard(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    const userId = ctx.user?.uid;
    return this.boardService.deleteBoard(id, userId);
  }

  @Mutation(() => Board)
  async addColumn(
    @Arg('boardId') boardId: string,
    @Arg('input') input: ColumnInput,
    @Ctx() ctx: Context
  ): Promise<Board> {
    const userId = ctx.user?.uid;
    const column: Omit<Column, 'id'> = {
      ...input,
      cards: []
    };
    return this.boardService.addColumn(boardId, column, userId);
  }

  @Mutation(() => Board)
  async updateColumn(
    @Arg('boardId') boardId: string,
    @Arg('columnId') columnId: string,
    @Arg('input') input: ColumnUpdateInput,
    @Ctx() ctx: Context
  ): Promise<Board> {
    console.log(`Atualizando coluna ${columnId} no board ${boardId}`);
    console.log('Dados recebidos:', input);
    console.log('Usuário:', ctx.user?.uid);
    
    const userId = ctx.user?.uid;
    try {
      const result = await this.boardService.updateColumn(boardId, columnId, input, userId);
      console.log('Coluna atualizada com sucesso');
      return result;
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
      throw error;
    }
  }

  @Mutation(() => Board)
  async deleteColumn(
    @Arg('boardId') boardId: string,
    @Arg('columnId') columnId: string,
    @Ctx() ctx: Context
  ): Promise<Board> {
    const userId = ctx.user?.uid;
    return this.boardService.deleteColumn(boardId, columnId, userId);
  }

  @Mutation(() => Board)
  async addCard(
    @Arg('boardId') boardId: string,
    @Arg('columnId') columnId: string,
    @Arg('input') input: CardInput,
    @Ctx() ctx: Context
  ): Promise<Board> {
    console.log('AddCard - Dados recebidos:', JSON.stringify(input, null, 2));
    
    const userId = ctx.user?.uid;
    
    // Garantir que os campos obrigatórios existam e tenham o tipo correto
    const cardData: Omit<Card, 'id'> = {
      title: input.title || '',
      description: input.description || '',
      tags: Array.isArray(input.tags) ? input.tags.map(tag => ({ ...tag, id: Date.now().toString() })) : [],
      dueDate: input.dueDate,
      attachments: Array.isArray(input.attachments) ? input.attachments.map(attachment => ({ ...attachment, id: Date.now().toString() })) : [],
      order: typeof input.order === 'number' ? input.order : 0
    };
    
    console.log('AddCard - Dados processados:', JSON.stringify(cardData, null, 2));
    
    return this.boardService.addCard(boardId, columnId, cardData, userId);
  }

  @Mutation(() => Board)
  async updateCard(
    @Arg('boardId') boardId: string,
    @Arg('columnId') columnId: string,
    @Arg('cardId') cardId: string,
    @Arg('input') input: CardInput,
    @Ctx() ctx: Context
  ): Promise<Board> {
    console.log('UpdateCard - Dados recebidos:', JSON.stringify(input, null, 2));
    
    const userId = ctx.user?.uid;
    
    // Garantir que os campos obrigatórios existam e tenham o tipo correto
    const cardData: Omit<Card, 'id'> = {
      title: input.title || '',
      description: input.description || '',
      tags: Array.isArray(input.tags) ? input.tags.map(tag => ({ ...tag, id: Date.now().toString() })) : [],
      dueDate: input.dueDate,
      attachments: Array.isArray(input.attachments) ? input.attachments.map(attachment => ({ ...attachment, id: Date.now().toString() })) : [],
      order: typeof input.order === 'number' ? input.order : 0
    };
    
    console.log('UpdateCard - Dados processados:', JSON.stringify(cardData, null, 2));
    
    return this.boardService.updateCard(boardId, columnId, cardId, cardData, userId);
  }

  @Mutation(() => Board)
  async deleteCard(
    @Arg('boardId') boardId: string,
    @Arg('columnId') columnId: string,
    @Arg('cardId') cardId: string,
    @Ctx() ctx: Context
  ): Promise<Board> {
    const userId = ctx.user?.uid;
    return this.boardService.deleteCard(boardId, columnId, cardId, userId);
  }

  @Mutation(() => Board)
  async resetBoard(
    @Arg('id') id: string,
    @Ctx() ctx: Context
  ): Promise<Board> {
    console.log(`Resolver: Iniciando resetBoard para board ${id}`);
    const userId = ctx.user?.uid;
    return this.boardService.resetBoard(id, userId);
  }

  @Mutation(() => Board)
  async moveCard(
    @Arg('boardId') boardId: string,
    @Arg('sourceColumnId') sourceColumnId: string,
    @Arg('targetColumnId') targetColumnId: string,
    @Arg('cardId') cardId: string,
    @Arg('newOrder') newOrder: number,
    @Ctx() ctx: Context
  ): Promise<Board> {
    console.log(`Processando requisição moveCard: card ${cardId} de ${sourceColumnId} para ${targetColumnId} na posição ${newOrder}`);
    
    try {
      const userId = ctx.user?.uid;
      return this.boardService.moveCard(boardId, sourceColumnId, targetColumnId, cardId, newOrder, userId);
    } catch (error) {
      console.error('Erro ao mover card:', error);
      throw error;
    }
  }
} 