import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';

@Controller('columns/:columnId/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) { }

  @Get()
  findByColumns(@Param('columnId') columnId: string){
    return this.cardsService.findByColumn(columnId);
  }

  @Post()
  create( @Param('columnId') columnId: string, @Body() dto: CreateCardDto){
    return this.cardsService.create(columnId, dto);
  }
}
