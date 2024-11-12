import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardService: CardsService) { }

  @Get()
  findAll() {
    return this.cardService.findAll(); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(+id); 
  }

  @Post()
  create(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('columnId') columnId: number,
    @Body('order') order?: number 
  ) {
    console.log(`Criando card com título: ${title}, descrição: ${description}, colunaId: ${columnId}, order: ${order}`);
    return this.cardService.create(title, description, columnId, order); 
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('columnId') columnId: number,
    @Body('order') order?: number 
  ) {
    console.log(`Editando card com título: ${title}, descrição: ${description}, colunaId: ${columnId}, order: ${order}`);
    return this.cardService.update(+id, title, description, columnId, order); 
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    console.log(`Card Deletado`);
    return this.cardService.remove(+id);
  }
}
