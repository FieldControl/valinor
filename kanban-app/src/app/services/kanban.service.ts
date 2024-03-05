import { HttpClient } from '@angular/common/http';
import { Column } from '../models/column.model';
import { Card } from '../models/card.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  columnService: any;
  column: any;
  cardService: any;
  card: any;
  cardRepository: any;
  columnRepository: any;

  constructor(private http: HttpClient) { }

  getColumns(): Column[] {
    return this.columnService.getColumns();
  }

  addColumn(column: Column): void {
    this.column.push(column);
  }

  getCards(): Card[] {
    return this.cardService.getCards();
  }

  addCRD(card: Card): void {
    this.card.push(card);
  }


  async moveCard(cardId: number, columnId: number): Promise<void> {
    const card = await this.cardRepository.findOne(cardId);
    if (!card) {
      throw new Error('Card não encontrado');
    }

    const column = await this.columnRepository.findOne(columnId);
    if (!column) {
      throw new Error('Coluna não encontrada');
    }

    card.column = column;
    await this.cardRepository.save(card);
  }

  async createCard(card: Card): Promise<Card> {
    const column = await this.columnRepository.findOne(card.columnId);
    if (!column) {
      throw new Error('Coluna não encontrada');
    }
  
    if (column.maxCards && column.cards.length >= column.maxCards) {
      throw new Error('Limite de cards na coluna atingido');
    }
  
    return await this.cardRepository.save(card);
  }
}

