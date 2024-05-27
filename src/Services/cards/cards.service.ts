import { Injectable, BadRequestException } from '@nestjs/common';
import { CardDTO } from 'src/DTO/cards.dto';
import { CardRepository } from 'src/Mongo/Repository/card.repository';
import { Card } from 'src/Mongo/Interfaces/card.interface';

@Injectable()
export class CardsService {

    constructor(
        private readonly cardRepository: CardRepository
    ) { }

    async getCardById(cardID: string): Promise<Card> {

        try {
            const existCard = await this.cardRepository.getCardById(cardID);

            if (!existCard)
                throw new BadRequestException('Nenhum resultado');

            return existCard;

        } catch (e) {
            throw new BadRequestException('Nenhum resultado');
        }

    }

    async getAllCards(): Promise<Card> {
        return await this.cardRepository.getAllCards();

    }

    async saveCard(newCard: CardDTO): Promise<Card> {
        return await this.cardRepository.saveCard(newCard);
    }

    async deleteCardById(cardID: string): Promise<Card> {

        try {
            return await this.cardRepository.deleteCardById(cardID)
        } catch (e) {
            throw new BadRequestException('Nenhum resultado');
        }

    }

    async updateCardById(cardID: string, newCard: CardDTO): Promise<Card> {

        const existCard = await this.cardRepository.getCardById(cardID);

        if (!existCard)
            throw new BadRequestException('Nenhum resultado');

        const updateCard = await this.cardRepository.updateCardById(cardID, newCard);

        if (updateCard)
            return this.cardRepository.getCardById(cardID);
        else
            throw new BadRequestException('Erro ao atualizar')
    }

}
