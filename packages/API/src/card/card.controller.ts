import { Controller, Get, Post, Body, Delete, Patch, Param} from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @Get()
  async getCard(): Promise<any[]> {
    return await this.cardService.getCard();
  }

  @Post()
  async create(@Body() body: { title: string, columnId: number }) {
    await this.cardService.createCard(body);
    return { message: 'Cartão criado com sucesso' };
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.cardService.deleteCard(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: { title?: string; columnId?: number }) {
    return this.cardService.updateCard(id, body);
  }

}
