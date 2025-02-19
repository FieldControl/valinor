import { Controller, Body, Get, Post, Put, Delete, Param } from '@nestjs/common';
import { CardsService } from './cards.service';
import { cardDTO } from './cards.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CARDS')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post()
   async create(@Body() data: cardDTO){
    await this.cardsService.create({
      ...data,
      columnId: Number(data.columnId)
    });
  }

  @Get()
  async findAll(){
    return await this.cardsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number){
    return await this.cardsService.findById(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: cardDTO){
    return await this.cardsService.update(Number(id), data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number){
    return await this.cardsService.delete(Number(id));
  }
}
