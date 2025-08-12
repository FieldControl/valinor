import { Controller, Get, Post, Body } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  async getCard(): Promise<any[]> {
    return await this.cardService.getCard();
  }

  @Post()
  async createCard(@Body() body: { nome: string}) {
    await this.cardService.createCard(body.nome);
    return { message: 'Cartão criado com sucesso' };
  }
}
