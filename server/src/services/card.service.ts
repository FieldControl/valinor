import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CardEntity } from '../entities/card.entity';

@Injectable()
export class CardService {
    constructor(
        @InjectRepository(CardEntity)
        private readonly cardRepository: Repository<CardEntity>,
    ) {}

    async createCard(card: CardEntity): Promise<CardEntity> {
        return this.cardRepository.save(card);
    }

    async getAllCards(): Promise<CardEntity[]> {
        return this.cardRepository.find();
    }

    async getCardById(id: number): Promise<CardEntity> {
        return this.cardRepository.findOne({ where: { id } });
    }

    async updateCard(id: number, card: CardEntity): Promise<CardEntity> {
        await this.cardRepository.update(id, card);
        return this.cardRepository.findOne({ where: { id } });
    }

    async deleteCard(id: number): Promise<void> {
        await this.cardRepository.delete(id);
    }
}