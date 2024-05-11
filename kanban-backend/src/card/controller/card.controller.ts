import { Body, Controller, Delete, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { Card } from '../model/card.model';
import { CardService } from '../service/card.service';
import { UpdateCardLocationDto } from '../dto/update-card-location.dto';

@Controller('api/card')
export class CardController {
  
  constructor(private readonly cardService: CardService) {}

  @Post('/create')
  async createCard(@Body('columnId') columnId: number, @Body('title') title: string) {
    return this.cardService.createCard(columnId, title);
  }

  @Get()
  async getAllCards(): Promise<Card[]> {
    return this.cardService.getCards();
  }

  @Put(':id')
  async updateCardTitle(@Param('id') cardId: number, @Body('title') newTitle: string): Promise<Card> {
    return this.cardService.updateCardTitle(cardId, newTitle);
  }

  @Get('column/:id')
  async getCardsByColumnId(@Param('id') columnId: number): Promise<Card[]> {
    return this.cardService.getCardsByColumnId(columnId);
  }

  @Post('/update-location')
  async updateCardLocation(@Body() updateCardLocationDto: UpdateCardLocationDto) {
    return this.cardService.updateCardLocation(updateCardLocationDto);
  }

}
