import { Controller, Get, Post, Body, Put, Delete, Param } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { Column } from './entities/column.entity';
import { Card } from './entities/card.entity';

@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get('columns')
  getColumns(): Promise<Column[]> {
    // Call KanbanService method to get all columns
    return this.kanbanService.getAllColumns();
  }

  @Get('cards')
  getCards(): Promise<Card[]> {
    // Call KanbanService method to get all cards
    return this.kanbanService.getAllCards();
  }

  @Post('columns')
  createColumn(@Body() column: Column) {
    // Call KanbanService method to create a new column
    return this.kanbanService.createColumn(column);
  }

  @Post('cards')
  createCard(@Body() card: Card) {
    // Call KanbanService method to create a new card
    return this.kanbanService.createCard(card);
  }

  @Put('columns/:id')
  updateColumn(@Param('id') id: number, @Body() column: Column) {
    // Call KanbanService method to update a column
    return this.kanbanService.updateColumn(id, column);
  }

  @Put('cards/:id')
  updateCard(@Param('id') id: number, @Body() card: Card) {
    // Call KanbanService method to update a card
    return this.kanbanService.updateCard(id, card);
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id') id: number) {
    // Call KanbanService method to delete a column
    return this.kanbanService.deleteColumn(id);
  }

  @Delete('cards/:id')
  deleteCard(@Param('id') id: number) {
    // Call KanbanService method to delete a card
    return this.kanbanService.deleteCard(id);
  }
}
