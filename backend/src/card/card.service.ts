import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>) {}
    
  async create(createCardDto: CreateCardDto) {
    const card = this.cardRepository.create(createCardDto);
    return await this.cardRepository.save(card);
  }

  async findAll() {     //verificando se existe algum card criado
    if (!await this.cardRepository.find()) throw new NotFoundException('Nenhum card encontrado.')
    return await this.cardRepository.find();
  }

  async findOne(id: number) { //verificando se o id corresponde com o existe
    if (!await this.cardRepository.findOneBy({id})) throw new NotFoundException(`Card id:${id} não encontrada`)
    return await this.cardRepository.findOneBy({id});
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.cardRepository.findOneBy({id});
    if (!card) {
      throw new NotFoundException(`Card id:${id} não encontrada.`);
    }
    card.description = updateCardDto.description; 
    return await this.cardRepository.save(card);
  }

  async remove(id: number) {
    const card = await this.findOne(id);
    await this.cardRepository.remove(card);
    return { message: `Card id:${id} removida com sucesso.` };
  }
}
