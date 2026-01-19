import { Controller, Get, Post, Body, Delete, Param, Patch } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  //Listar todos os cards
  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  // Criar card usando DTO
  @Post()
  create(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto);
  }

  //Excluir card
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.cardsService.delete(Number(id));
  }
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() data: UpdateCardDto
  ) {
    return this.cardsService.update(id, data);
  }

  @Patch(':id/column')
  updateColumn(
    @Param('id') id: number,
    @Body('columnId') columnId: number,
) {
    return this.cardsService.updateCardColumn(id, columnId);
}
}
