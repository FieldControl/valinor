import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  
  constructor(
    @InjectRepository(Card)
    private readonly cardsRepository: Repository<Card>,
  ) {}
  
  
  async create(createCardDto: CreateCardDto): Promise<Card> {
    const card = this.cardsRepository.create(createCardDto);
    return await this.cardsRepository.save(card);
  }

  async findAll(): Promise<Card[]> {
    return await this.cardsRepository.find();
  }

  async findOne(id: number): Promise<Card> {
    return await this.cardsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
    await this.cardsRepository.update(id, updateCardDto);
    const updatedCard = await this.cardsRepository.findOne({ where: { id } });
    if (!updatedCard) {
      throw new NotFoundException(`Card #${id} not found`);
    }
    return await this.cardsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.cardsRepository.delete(id);
  }
}
