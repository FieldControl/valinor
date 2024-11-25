import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CardsService } from '../services/cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // Lista todos os cards
  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  // Cria um novo card
  @Post()
  create(@Body() body: { title: string; description: string; columnId: number }) {
    const { title, description, columnId } = body;
    return this.cardsService.create(title, description, columnId);
  }

  // Atualiza um card
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() body: { title?: string; description?: string; columnId?: number },
  ) {
    return this.cardsService.update(id, body);
  }

  //muda a coluna a qual um card pertence
  @Patch(':id/column/:columnId')
  moveCard(@Param('id') id: number, @Param('columnId') columnId: number) {
    return this.cardsService.update(id, { title: null, description: null, columnId });
  }


  // Exclui um card
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.cardsService.delete(id);
  }
}
