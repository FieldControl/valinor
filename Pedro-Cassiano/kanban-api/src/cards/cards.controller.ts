import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Controller('cards') // <-- GARANTE que todas as rotas aqui começam com /cards
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post() // <-- DIZ que este método responde a requisições POST para /cards
  create(@Body() createCardDto: CreateCardDto) {
    // A anotação @Body() pega os dados JSON da requisição
    return this.cardsService.create(createCardDto);
  }

  // O resto dos métodos gerados...
  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardsService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(+id);
  }
}