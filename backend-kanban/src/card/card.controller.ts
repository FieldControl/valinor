import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CardsService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardsService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

    @Put(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    const cardId = Number(id); 
    return this.cardService.update(cardId, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const cardId = Number(id); 
    return this.cardService.remove(cardId);
  }
}
