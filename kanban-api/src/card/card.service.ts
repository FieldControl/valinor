import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { Column } from '../column/column.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  /**
   * 
   * @param title 
   * @param description 
   * @param columnId 
   * @param order 
   * @returns 
   */
  async createCard(
    title: string,
    description: string,
    columnId: number,
    order: number,
  ): Promise<Card> {
    
    if (!columnId) {
      throw new Error('Coluna é obrigatório informar!');
    }
   
    if (!description) {
      throw new Error('Descrição é obrigatório informar!');
    }
    if (!title) {
      throw new Error('Título é obrigatório informar!');
    }
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    if (!column) {
      throw new Error(`Coluna ${columnId} não localizada!`);
    }

    
    if (order === undefined || order === null) {
      const lastCard = await this.cardRepository.findOne({
        where: { column: { id: columnId } },
        order: { order: 'DESC' },
      });
      order = lastCard ? (lastCard.order ?? 0) + 1 : 0; 
    }
    const newCard = this.cardRepository.create({
      title,
      description,
      column,
      order,
    });
    return this.cardRepository.save(newCard);
  }

  async findAllCards(): Promise<Card[]> {
    return this.cardRepository.find();
  }

  async findCardById(id: number): Promise<Card | null> {
    return this.cardRepository.findOne({ where: { id } });
  }

  async updateCard(
    id: number,
    title: string,
    description: string,
    columnId: number,
  ): Promise<Card | null> {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) {
      return null;
    }
    
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });
    if (!column) {
      throw new Error('Coluna não encontrada!');
    }
    card.column = column; 

    card.title = title;
    card.description = description;
    return this.cardRepository.save(card);
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await this.cardRepository.delete(id);
    return typeof result.affected === 'number' && result.affected > 0;
  }

  async moveCard(id: number, columnId: number): Promise<Card | null> {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) {
      return null;
    }
    const column = await this.columnRepository.findOne({ where: { id: columnId } });
    if (!column) {
      throw new Error('Coluna não encontrada!');
    }
    card.column = column;
    const lastCard = await this.cardRepository.findOne({
      where: { column: { id: columnId } },
      order: { order: 'DESC' },
    });
    card.order = lastCard ? (lastCard.order ?? 0) + 1 : 0;
    await this.cardRepository.save(card);
    
    return this.cardRepository.findOne({
      where: { id: card.id },
      relations: ['column'],
    });
  }

  async reorderCard(id: number, newIndex: number): Promise<Card | null> {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) {
      return null;
    }
    card.order = newIndex;
    return this.cardRepository.save(card);
  }

  async findCardsByColumnId(columnId: number): Promise<Card[]> {
    return this.cardRepository.find({
      where: { column: { id: columnId } },
      order: { order: 'ASC' }, 
    });
  }

  async findCardsByTitle(title: string): Promise<Card[]> {
    return this.cardRepository.find({
      where: { title },
    });
  }

  async findCardsByDescription(description: string): Promise<Card[]> {
    return this.cardRepository.find({
      where: { description },
    });
  }

  async findCardsByOrder(order: number): Promise<Card[]> {
    return this.cardRepository.find({
      where: { order },
    });
  }
}
