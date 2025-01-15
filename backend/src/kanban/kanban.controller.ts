import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { KanbanService } from './kanban.service';

@Controller('kanban')
export class KanbanController {
  constructor(private kanbanService: KanbanService) {}

  @Post('boards')
  async createBoard(@Body('title') title: string) {
    return this.kanbanService.createBoard(title);
  }

  @Get('boards')
  async getBoards() {
    return this.kanbanService.getBoards();
  }

  @Get('boards/:id')
  async getBoard(@Param('id') id: string) {
    return this.kanbanService.getBoard(id);
  }

  @Put('boards/:id')
  async updateBoard(@Param('id') id: string, @Body('title') title: string) {
    return this.kanbanService.updateBoard(id, title);
  }

  @Delete('boards/:id')
  async deleteBoard(@Param('id') id: string) {
    await this.kanbanService.deleteBoard(id);
    return { message: 'Board excluído com sucesso' };
  }

  @Get('boards/:id/columns')
  async getColumnsByBoardId(@Param('id') id: string) {
    return this.kanbanService.getColumnsByBoardId(id);
  }

  @Post('boards/:id/columns')
  async createColumn(@Param('id') id: string, @Body('title') title: string) {
    return this.kanbanService.createColumn(id, title);
  }

  @Put('columns/:id')
  async updateColumn(@Param('id') id: string, @Body('title') title: string) {
    return this.kanbanService.updateColumn(id, title);
  }

  @Delete('columns/:id')
  async deleteColumn(@Param('id') id: string) {
    await this.kanbanService.deleteColumn(id);
  }

  @Post('columns/:id/cards')
  async createCard(@Param('id') id: string, @Body('description') description: string) {
    return this.kanbanService.createCard(id, description);
  }

  @Get('cards/:id')
  async getCardById(@Param('id') id: string) {
    return this.kanbanService.getCardById(id);
  }

  @Put('cards/:id')
  async updateCard(@Param('id') id: string, @Body('isCompleted') isCompleted: boolean) {
    return this.kanbanService.updateCard(id, isCompleted);
  }

  @Delete('cards/:id')
  async deleteCard(@Param('id') id: string) {
    await this.kanbanService.deleteCard(id);
  }

  @Put('cards/:id/description')
  async updateCardDescription(@Param('id') id: string, @Body('description') description: string) {
    return this.kanbanService.updateCardDescription(id, description);
  }
}
