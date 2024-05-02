import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

import { CardService } from '../services/card.service';
import { CardEntity } from '../entities/card.entity';

@Controller('cards')
export class CardController {
    constructor(private readonly cardService: CardService) {}

    @Post()
    async create(@Body() card: CardEntity): Promise<CardEntity> {
        return this.cardService.createCard(card);
    }

    @Get()
    async findAll(): Promise<CardEntity[]> {
        return this.cardService.getAllCards();
    }

    @Get(':id')
    async findById(@Param('id') id: number): Promise<CardEntity> {
        return this.cardService.getCardById(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() card: CardEntity): Promise<CardEntity> {
        return this.cardService.updateCard(id, card);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.cardService.deleteCard(id);
    }
}
