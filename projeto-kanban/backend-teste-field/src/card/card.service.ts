import { Injectable } from '@nestjs/common';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RemoveCardInput } from './dto/remove-card.input';

@Injectable()
export class CardService {
	constructor(
		@InjectRepository(Card)
		private cardRepository: Repository<Card>,
	) { }

	async create(createCardInput: CreateCardInput) {
		const card = this.cardRepository.create(createCardInput);
		return this.cardRepository.save(card);
	}

	findAll(): Promise<Card[]> {
		return this.cardRepository.find();
	}

	findOne(id: number): Promise<Card | null> {
		const card = this.cardRepository.findOneBy({ id });
		if (!card) {
			throw new NotFoundException(`Card com id ${id} não encontrado`);
		}
		return card;
	}

	async update(updateCardInput: UpdateCardInput) {
		const card = await this.cardRepository.preload(updateCardInput);
		if (!card) {
			throw new Error(`Card com id ${updateCardInput.id} não encontrado`);
		}
		return this.cardRepository.save(card);
	}

	async remove(removeCardInput: RemoveCardInput) {

		const card = await this.cardRepository.findOne({ where: { id: removeCardInput.id } });

		if (card) {
			this.cardRepository.remove(card);
			return card;
		} else {
			throw new Error('Card not found');
		}
	}
}
