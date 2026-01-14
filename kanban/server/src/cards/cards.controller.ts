import { Body, Controller, Get, Param, Post, Patch, Delete } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) { }

  @Get('columns/:columnId/cards')
  findByColumns(@Param('columnId') columnId: string) {
    return this.cardsService.findByColumn(columnId);
  }

  @Post('columns/:columnId/cards')
  create(@Param('columnId') columnId: string, @Body() dto: CreateCardDto) {
    return this.cardsService.create(columnId, dto);
  }

  @Patch('cards/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(id, dto);
  }

  @Delete('cards/:id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(id);
  }

}
