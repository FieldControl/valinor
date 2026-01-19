import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from './card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { ColumnEntity } from '../columns/column.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,

    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
  ) {}

  //Listar todos os cards
  findAll() {
    return this.cardRepository.find({
      relations: ['column'],
    });
  }

  //Criar um card e associar ele a coluna
  async create(dto: CreateCardDto) {
    const column = await this.columnRepository.findOne({
      where: { id: dto.columnId },
    });

    if (!column) {
      throw new NotFoundException('Coluna não encontrada');
    }

    const card = this.cardRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      column,
    });

    return this.cardRepository.save(card);
  }

  //Excluir um card
  async delete(id: number) {
    const card = await this.cardRepository.findOne({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Card não encontrado');
    }

    await this.cardRepository.remove(card);
    return card;
  }
  async update(id: number, data: Partial<CardEntity>) {
    await this.cardRepository.update(id, data);
    return this.cardRepository.findOne({
        where: { id },
    });
  }

  async updateCardColumn(cardId: number, columnId: number) {
    const card = await this.cardRepository.findOne({
        where: { id: cardId },
        relations: ['column'],
    });

    if (!card) {
        throw new NotFoundException('Card não encontrado');
    }

    card.column = { id: columnId } as any;

    return this.cardRepository.save(card);
  }
}
