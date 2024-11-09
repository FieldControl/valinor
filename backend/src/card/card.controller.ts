import { Controller, Post, Get, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  async create(@Body() cardData: { title: string, description: string, columnId: number }) {
    try {
      return await this.cardService.createCard(cardData.title, cardData.description, cardData.columnId);
    } catch (error) {
      console.error('Error creating card:', error);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.cardService.findAll();
    } catch (error) {
      console.error('Error retrieving cards:', error);
      throw new HttpException('Error retrieving cards', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':columnId')
  async findAllByColumn(@Param('columnId') columnId: number) {
    try {
      return await this.cardService.findAllByColumn(columnId);
    } catch (error) {
      console.error('Error retrieving cards for column:', error);
      throw new HttpException('Error retrieving cards for column', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
