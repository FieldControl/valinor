import { Injectable } from '@nestjs/common';
import { Card } from './card.model';
import { CreateCardInput } from './dto/create-card.input';
import { UpdateCardInput } from './dto/update-card.input';
import { v4 as uuid } from 'uuid';
import { ColumnService } from '../column/column.service';

@Injectable()
export class CardService {
  private cards: Card[] = [];

  constructor(private columnService: ColumnService) {}

  //Retorna todos os cards
  findAll(): Card[] {
    return this.cards;
  }

  //Cria um novo card e adiciona na coluna correspondente
  create(input: CreateCardInput): Card {
    const card: Card = {
      id: uuid(),
      title: input.title,
      description: input.description ?? '',
      columnId: input.columnId,
    };
    this.cards.push(card);
    this.columnService.addCardToColumn(card, input.columnId);
    return card;
  }

  //Atualiza o título e descrição de um card
  update(id: string, title: string, description: string): Card {
    const card = this.cards.find((c) => c.id === id);
    if (!card) throw new Error('Card not found');
    card.title = title;
    card.description = description;
    return card;
  }

  //Remove o card da lista local e da coluna correspondente
  delete(id: string): boolean {
    const index = this.cards.findIndex((c) => c.id === id);
    if (index === -1) return false;

    const [deletedCard] = this.cards.splice(index, 1);
    const column = this.columnService.findAll().find((col) => col.id === deletedCard.columnId);
    if (column) {
      column.cards = column.cards.filter((c) => c.id !== id);
    }
    return true;
  }

  //Move o card para outra coluna
  moveCardToColumn(cardId: string, newColumnId: string): Card {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');
    
    //Remove da coluna atual
    const oldColumn = this.columnService.findAll().find(col => col.id === card.columnId);
    if (oldColumn) {
      oldColumn.cards = oldColumn.cards.filter(c => c.id !== cardId);
    }
  
    //Atualiza o columnId do card
    card.columnId = newColumnId;
  
    //Adiciona na nova coluna
    const newColumn = this.columnService.findAll().find(col => col.id === newColumnId);
    if (newColumn) {
      newColumn.cards.push(card);
    }
  
    return card;
  }
}
