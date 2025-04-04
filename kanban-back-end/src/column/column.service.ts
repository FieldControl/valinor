import { Injectable } from '@nestjs/common';
import { Column } from './column.model';
import { Card } from '../card/card.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ColumnService {
  //Esta linha armazena colunas em memória
  private columns: Column[] = [];

  //Este bloco retorna todas as colunas existentes
  getAll(): Column[] {
    return this.columns;
  }

  //Este bloco cria uma nova coluna com título e ID gerado
  create(title: string): Column {
    const newColumn: Column = {
      id: uuidv4(),
      title,
      cards: [], //Inicializa com lista vazia de cards
    };
    this.columns.push(newColumn);
    return newColumn;
  }

  //Este bloco busca uma coluna pelo ID
  getById(id: string): Column | undefined {
    return this.columns.find(col => col.id === id);
  }

  //Este bloco associa um novo card a uma coluna existente
  addCardToColumn(columnId: string, card: Card): void {
    const column = this.getById(columnId);
    if (column) {
      column.cards = column.cards ?? []; //Esta linha garante que a lista está inicializada
      column.cards.push(card); //Esta linha adiciona o novo card à coluna
    }
  }
}
