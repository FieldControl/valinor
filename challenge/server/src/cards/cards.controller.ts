import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dtos/create-card.dto';
import { EditCardDto } from './dtos/edit-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
  async createCard(@Body() createCardDto: CreateCardDto) {
    return this.cardsService.createCard(createCardDto);
  }

  @Get('/:columnId')
  async listCards(@Param('columnId') columnId: string) {
    return this.cardsService.listCards(Number(columnId));
  }

  @Delete('/:id')
  async deleteCard(@Param('id') cardId: string) {
    await this.cardsService.deleteCard(Number(cardId));
  }

  @Patch('/:id')
  async editCard(
    @Param('id') cardId: string,
    @Body() editCardDto: EditCardDto,
  ) {
    return await this.cardsService.editCard(Number(cardId), editCardDto);
  }
}
