import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { v4 as uuid } from 'uuid';

@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('kanbans/:kanban_id/cards')
  async create(@Body() createCardDto: CreateCardDto) {
    const card = new Card();
    card.id = uuid();
    card.title = createCardDto.title
    card.description = createCardDto.description
    card.kanban_id = createCardDto.kanban_id
    card.date_end = createCardDto.date_end
    this.cardsService.create(card)
    return {
      card: card,
      message: "Cartão criado com sucesso !"
    }
  }

  @Get('kanbans/:kanban_id/cards')
  findAll(@Param('kanban_id') kanbanId: string) {
    return this.cardsService.findAll(kanbanId);
  }

  @Get('cards/:id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch('cards/:id')
  async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    const card = await this.cardsService.update(id, updateCardDto);
    return {
      card: card,
      message: "Cartão alterado com sucesso"
    }
  }

  @Patch('cards/:id/badge/:badge_id')
  async linkBadgeToCard (
    @Param('id') card_id: string,
    @Param('badge_id') badge_id: string,
  ){
    const link = await this.cardsService.linkBadgeToCard(card_id,badge_id);
    return {
      link: link,
      message: "Badge colocado no cartão com sucesso"
    }
  }

  @Delete('cards/:id')
  async remove(@Param('id') id: string) {
    const card = await this.cardsService.remove(id);
    return  {
      card: card,
      message: "Cartão deletado com sucesso"
    }
  }

  @Delete('cards/:id/badge/:badge_id')
  async unlinkBadgeToCard(
    @Param('id') card_id: string,
    @Param('badge_id') badge_id: string,
  ){
    const unlink = await this.cardsService.unlinkBadgeToCard(card_id, badge_id);
    return {
      unlink: unlink,
      message: "Badge retirado do cartão com sucesso"
    }
  }
}
