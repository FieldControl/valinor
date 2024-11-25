import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { Column } from '../entities/column.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Column)
    private readonly columnRepository: Repository<Column>,
  ) {}

  // Lista todos os cards
  findAll() {
    return this.cardRepository.find({ relations: ['column'] });
  }

  // Cria um novo card vinculado a uma coluna
  async create(title: string, description: string, columnId: number) {
    const column = await this.columnRepository.findOneBy({ id: columnId });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    const card = this.cardRepository.create({ title, description, column });
    return this.cardRepository.save(card);
  }

  // Atualiza os detalhes ou a coluna de um card
  async update(id: number, updateData: { title?: string; description?: string; columnId?: number }) {
    const card = await this.cardRepository.findOneBy({ id });
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (updateData.columnId) {
      const newColumn = await this.columnRepository.findOneBy({ id: updateData.columnId });
      if (!newColumn) {
        throw new NotFoundException('New column not found');
      }
      card.column = newColumn; // Atualiza a coluna do card
    }

    if (updateData.title !== undefined) card.title = updateData.title;
    if (updateData.description !== undefined) card.description = updateData.description;

    return this.cardRepository.save(card);
  }

  // Exclui um card por ID
  async delete(id: number) {
    const result = await this.cardRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Card not found');
    }
    return { message: 'Card deleted successfully' };
  }
}
