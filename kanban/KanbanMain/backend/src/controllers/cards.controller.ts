import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CardsService } from '../cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  /** CRUD CARDS */

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Post()
  createCard(@Body() body: { title: string; description: string; columnId: number }) {
    const { title, description, columnId } = body;
    return this.cardsService.create(title, description, columnId);
  }

  @Patch(':id')
  updateCard(
    @Param('id') id: number, @Body() body: { title?: string; description?: string; columnId?: number },
  ) {
    return this.cardsService.update(id, body);
  }

  @Patch(':id/column/:columnId')
  moverCard(@Param('id') id: number, @Param('columnId') columnId: number) {
    return this.cardsService.update(id, { title: null, description: null, columnId });
  }

  @Delete(':id')
  deletarCard(@Param('id') id: number) {
    return this.cardsService.delete(id);
  }
}
