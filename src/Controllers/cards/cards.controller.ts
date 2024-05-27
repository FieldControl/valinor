import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CardDTO } from '../../DTO/cards.dto';
import { CardsService } from 'src/Services/cards/cards.service';
import { Card } from 'src/Mongo/Interfaces/card.interface';
import { promises } from 'dns';

@Controller('cards')
export class CardsController {

    constructor(
        private readonly cardService: CardsService
    ) { }

    @Get()
    async getAllCards(): Promise<Card> {
        return await this.cardService.getAllCards();
    }


    @Get(':cardID')
    async getCardByI(@Param('cardID') cardID: string): Promise<Card> {
        return this.cardService.getCardById(cardID);
    }

    @Post()
    async saveCard(@Body() newCard: CardDTO): Promise<Card> {
        return await this.cardService.saveCard(newCard);
    }

    @Patch(':cardID')
    async updateCardById(@Param('cardID') cardID: string, @Body() newCard: CardDTO): Promise<Card> {
        return await this.cardService.updateCardById(cardID, newCard);
    }

    @Delete(':cardID')
    async deleteCardById(@Param('cardID') cardID: string): Promise<Card> {
        return await this.cardService.deleteCardById(cardID);
    }

}
