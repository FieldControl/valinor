import { Controller, Request, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { AuthGuard, PayloadRequest } from '../auth/auth/auth.guard';
import { ReorderedCardDto } from './dto/reorder-cards.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCardDto: CreateCardDto, @Request() req: PayloadRequest) {
    return this.cardService.create(createCardDto, req.usuario.id);
  }

  @Put('update-order')
  @UseGuards(AuthGuard)
  updateOrder(@Body() reorderCards: ReorderedCardDto,@Request() req: PayloadRequest,) {
    return this.cardService.updateCardOrdersEColunas(
      reorderCards,
      req.usuario.id,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string,@Request() req: PayloadRequest,@Body() updateCardDto: UpdateCardDto,) {
    return this.cardService.update(+id, req.usuario.id, updateCardDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req: PayloadRequest) {
    return this.cardService.remove(+id, req.usuario.id);
  }
}
