//confiiguração padrão, service injetavel
import { Injectable } from '@nestjs/common';

//arquivos DTO das Colunas
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

//Database
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(Card) private cardRepository : Repository<Card>) {}
  

  create(createCardDto: CreateCardDto) {
    const card = new Card();
    card.name = createCardDto.name;
    card.content = createCardDto.content;
    card.order = createCardDto.order;
    card.columnId = createCardDto.columnId;
    return this.cardRepository.save(card);
  }

  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
