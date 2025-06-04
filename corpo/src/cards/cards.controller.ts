import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
    import { CardsService } from './cards.service';
    import { CreateCardDto } from './dto/create-card.dto';
    import { UpdateCardDto } from './dto/update-card.dto';
    import { Card } from '../entities/card.entity';

    @Controller('cards')
       export class CardsController {
constructor(private readonly cardsService: CardsService) {}

      @Get()
      async findAll(): Promise<Card[]> {
        return this.cardsService.findAll();
      }

      @Get(':id')
      async findOne(@Param('id') id: string): Promise<Card> {
        return this.cardsService.findOne(+id);
      }

      @Post()
      @HttpCode(HttpStatus.CREATED)
      async create(@Body() createCardDto: CreateCardDto): Promise<Card> {
        return this.cardsService.create(createCardDto);
      }

      @Put(':id')
      async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto): Promise<Card> {
        return this.cardsService.update(+id, updateCardDto);
      }

      @Delete(':id')
      @HttpCode(HttpStatus.NO_CONTENT)
      async remove(@Param('id') id: string): Promise<void> {
        await this.cardsService.remove(+id);
      }
    }