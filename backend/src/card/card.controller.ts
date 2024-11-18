import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CardService } from '../card.service';
import { Card } from './card.entity';

@Controller('cards') // Prefixo de rota para os endpoints dos cards
export class CardController {
  constructor(private readonly cardService: CardService) {}

  // Rota para criar um novo card
  @Post()
  create(@Body() cardData: Partial<Card>): Promise<Card> {
    return this.cardService.create(cardData);
  }

  // Rota para listar todos os cards
  @Get()
  findAll(): Promise<Card[]> {
    return this.cardService.findAll();
  }

  // Rota para buscar um card pelo ID
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Card> {
    return this.cardService.findOne(id);
  }

  // Rota para atualizar um card
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() cardData: Partial<Card>,
  ): Promise<Card> {
    return this.cardService.update(id, cardData);
  }

  // Rota para deletar um card
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.cardService.remove(id);
  }
}
