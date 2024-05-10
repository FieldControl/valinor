import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { KanbanService } from 'src/kanban/kanban.service';


@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Post('columns')
  async createColumn(@Body() body: { name: string }) {
    return this.kanbanService.createColumn(body.name);
  }

  @Get('columns')
  async getAllColumns() {
    return this.kanbanService.getAllColumns();
  }

  @Get('columns/:columnId')
  async getColumnById(@Param('columnId') columnId: string) {
    return this.kanbanService.getColumnById(columnId);
  }

  @Put('columns/:columnId')
  async updateColumn(
    @Param('columnId') columnId: string,
    @Body() body: { name: string }
  ) {
    return this.kanbanService.updateColumn(columnId, body.name);
  }

  @Delete('columns/:columnId')
  async deleteColumn(@Param('columnId') columnId: string) {
    return this.kanbanService.deleteColumn(columnId);
  }

  @Post('columns/:columnId/cards')
  async createCardInColumn(
    @Param('columnId') columnId: string,
    @Body() body: { title: string, description: string }
  ) {
    return this.kanbanService.createCard(columnId, body.title, body.description);
  }

  @Get('columns/:columnId/cards')
  async getCardsInColumn(@Param('columnId') columnId: string) {
    return this.kanbanService.getCardsInColumn(columnId);
  }

  @Put('columns/:columnId/cards/:cardId')
  async updateCard(
    @Param('cardId') cardId: string,
    @Body() body: { title: string, description: string }
  ) {
    return this.kanbanService.updateCard(cardId, body.title, body.description);
  }

  @Delete('columns/:columnId/cards/:cardId')
  async deleteCard(
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string
  ) {
    return this.kanbanService.deleteCard(cardId);
  }
}
