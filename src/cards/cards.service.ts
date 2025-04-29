import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';  
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

////Criação dos objetos dos cards

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  create(createCardDto: CreateCardDto) {
    const card = this.cardRepository.create(createCardDto);
    return this.cardRepository.save(card);
  }

  findAll() {
    return this.cardRepository.find({
      relations: ['coluna'],
      order: {
        id: 'ASC'
      }
    });
  }

  findOne(id: number) {
    return this.cardRepository.findOne({ where: { id }, relations: ['coluna'] });
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    console.log(updateCardDto);
    return this.cardRepository.update(id, {
      nome:updateCardDto.nome,
      descricao:updateCardDto.descricao,
      colunaId:updateCardDto.colunaId
    });
  }

  remove(id: number) {
    return this.cardRepository.delete(id);
  }
}