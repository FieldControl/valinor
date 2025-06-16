// src/card/card.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entidades/card.entity';
import { ColumnEntity } from '../entidades/column.entity'; // Importe a entidade ColumnEntity
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(ColumnEntity) // Injeta o repositório da entidade ColumnEntity
    private columnRepository: Repository<ColumnEntity>,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const { columnId, title, description, order } = createCardDto;

    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException(`Column with ID "${columnId}" not found.`);
    }

    const newCard = this.cardRepository.create({
      title,
      description,
      order,
      column, // Associa o cartão à coluna encontrada
    });
    return this.cardRepository.save(newCard);
  }

  async findAll(): Promise<Card[]> {
    return this.cardRepository.find({ relations: ['column'] }); // Inclui a coluna relacionada
  }

  async findOne(id: number): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: ['column'], // Inclui a coluna relacionada
    });
    if (!card) {
      throw new NotFoundException(`Card with ID "${id}" not found.`);
    }
    return card;
  }

  async update(id: number, updateCardDto: UpdateCardDto): Promise<Card> {
    const card = await this.findOne(id); // Usa o findOne para verificar existência e carregar relações

    // Se houver columnId no DTO, verifica se a coluna existe
    if (updateCardDto.columnId) {
      const column = await this.columnRepository.findOne({
        where: { id: updateCardDto.columnId },
      });
      if (!column) {
        throw new NotFoundException(
          `Column with ID "${updateCardDto.columnId}" not found.`,
        );
      }
      card.column = column; // Atualiza a associação da coluna
    }

    this.cardRepository.merge(card, updateCardDto);
    return this.cardRepository.save(card);
  }

  async remove(id: number): Promise<void> {
    const result = await this.cardRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Card with ID "${id}" not found.`);
    }
  }

  // Método para obter cartões de uma coluna específica
  async findCardsByColumn(columnId: number): Promise<Card[]> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    if (!column) {
      throw new NotFoundException(`Column with ID "${columnId}" not found.`);
    }
    return this.cardRepository.find({
      where: { column: { id: columnId } },
      order: { order: 'ASC' }, // Ordena os cartões pela propriedade 'order'
    });
  }
}
