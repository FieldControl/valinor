import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { NotFoundException } from '@nestjs/common';
import { Column, Card } from './kanban.model';

@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  // Rota para pegar as colunas
  @Get('columns')
  async getColumns(): Promise<Column[]> {
    return this.kanbanService.getColumns();
  }

  // Rota para criar uma coluna
  @Post('columns')
  async createColumn(@Body('title') title: string): Promise<Column> {
    if (!title) {
      throw new NotFoundException('Title is required');
    }
    return this.kanbanService.createColumn(title);
  }

  // Rota para atualizar uma coluna
  @Put('columns/:id')
  async updateColumn(
    @Param('id') id: number,
    @Body('title') title: string,
  ): Promise<Column> {
    if (!title) {
      throw new NotFoundException('Title is required');
    }
    return this.kanbanService.updateColumn(id, title);
  }

  // Rota para deletar uma coluna
  @Delete('columns/:id')
  async deleteColumn(@Param('id') id: number): Promise<Column> {
    return this.kanbanService.deleteColumn(id);
  }

  // Rota para criar um card
  @Post('cards')
  async createCard(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('columnId') columnId: number,
  ): Promise<Card> {
    if (!title || !description || !columnId) {
      throw new NotFoundException('Title, description, and columnId are required');
    }
    return this.kanbanService.createCard(title, description, columnId);
  }

  // Rota para atualizar um card
  @Put('cards/:cardId')
  async updateCard(
    @Param('cardId') cardId: number,
    @Body('title') title: string,
    @Body('description') description: string,
  ): Promise<Card> {
    if (!title || !description) {
      throw new NotFoundException('Title and description are required');
    }
    return this.kanbanService.updateCard(cardId, title, description);
  }

  // Rota para deletar um card
  @Delete('cards/:cardId')
  async deleteCard(@Param('cardId') cardId: number): Promise<Card> {
    return this.kanbanService.deleteCard(cardId);
  }
}