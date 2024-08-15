import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReorderedCardDto } from './dto/reorder-cards.dto';
import { Card } from './entities/card.entity';
import { UpdateResult, DeleteResult } from 'typeorm';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  create(@Body() createCardDto: CreateCardDto, @Body('userId') userId: number): Promise<Card> {
    return this.cardService.create(createCardDto);
  }

  @Get()
  findAll(): Promise<Card[]> {
    return this.cardService.findAll(); // Certifique-se de que o método findAll está implementado em CardService
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Card> {
    return this.cardService.findOne(id); // Certifique-se de que o método findOne está implementado em CardService
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateCardDto: UpdateCardDto, @Body('userId') userId: number): Promise<UpdateResult> {
    return this.cardService.update(id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Body('userId') userId: number): Promise<DeleteResult> {
    return this.cardService.remove(id);
  }

  @Post('reorder')
  reorder(@Body() reorderCardsDto: ReorderedCardDto): Promise<void> {
    return this.cardService.reorder(reorderCardsDto);
  }
}
