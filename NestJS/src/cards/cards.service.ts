import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly repository: Repository<Card>
  ) {}
    
  async create(dto: CreateCardDto) {
    const card = this.repository.create(dto);
    return this.repository.save(card);
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(idCard: string) {
    return this.repository.findOne({ where: { idCard } });
  }

  async update(idCard: string, dto: UpdateCardDto) {
    const card = await this.repository.findOne({ where: { idCard } });
    if (!card) return null;
    this.repository.merge(card, dto);
    return this.repository.save(card);
  }

  async remove(idCard: string) {
    const card = await this.repository.findOne({ where: { idCard } });
    if (!card) return null;
    return this.repository.remove(card);
  }
}
