import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ReorderedCardDto } from './dto/reorder-cards.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.cardRepository.create(createCardDto);
    return this.cardRepository.save(card);
  }

  async findAll(): Promise<Card[]> {
    return this.cardRepository.find();
  }

  async findOne(id: number): Promise<Card> {
    return this.cardRepository.findOneBy({ id });
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
    await this.cardRepository.update(id, updateCardDto);
    return this.cardRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.cardRepository.delete(id);
  }

  async reorder(reorderedCardDto: ReorderedCardDto): Promise<void> {
    const { boardId, cards } = reorderedCardDto;

    // Lógica para reordenar os cards, pode variar dependendo do seu modelo
    // Aqui você poderia atualizar a ordem dos cards com base no boardId
    for (const card of cards) {
      await this.cardRepository.update(card.id, { order: card.order });
    }
  }
}
