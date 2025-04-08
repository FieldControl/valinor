import { Injectable } from '@nestjs/common';
import { Column } from './column.model';
import { CreateColumnInput } from './dto/create-column.input';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ColumnService {
  private columns: Column[] = [];

  //Retorna todas as colunas
  findAll(): Column[] {
    return this.columns;
  }

  //Cria uma nova coluna com título e id gerado
  create(input: CreateColumnInput): Column {
    const column: Column = {
      id: uuid(),
      title: input.title,
      cards: [],
    };
    this.columns.push(column);
    return column;
  }

  //Atualiza o título de uma coluna
  update(id: string, title: string): Column {
    const column = this.columns.find((c) => c.id === id);
    if (!column) throw new Error('Column not found');
    column.title = title;
    return column;
  }

  //Remove uma coluna pelo id
  delete(id: string): boolean {
    const index = this.columns.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.columns.splice(index, 1);
    return true;
  }

  //Adiciona um card à coluna informada
  addCardToColumn(card, columnId: string) {
    const column = this.columns.find((c) => c.id === columnId);
    if (column) {
      column.cards.push(card);
    }
  }

  //Remove um card da coluna informada
  removeCardFromColumn(cardId: string, columnId: string) {
    const column = this.columns.find((c) => c.id === columnId);
    if (column) {
      column.cards = column.cards.filter((card) => card.id !== cardId);
    }
  }
}
