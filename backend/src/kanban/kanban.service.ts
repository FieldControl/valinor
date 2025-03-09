import { Injectable } from '@nestjs/common';
import { Column, Card } from './kanban.model';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class KanbanService {
  //criando um array de colunas
  private columns: Column[] = [];
  private cardIdCounter = 1; //aqui vai criar um id unico para cada card

  //criando um metodo para retornar as colunas
  getColumns(): Column[] {
    return this.columns;
  }
  //metodo para criar as colunas
  createColumn(title: string): Column {
    const newColumn: Column = {
      id: this.columns.length + 1,
      title,
      cards: [],
    };
    this.columns.push(newColumn);
    return newColumn;
  }

  //atualizar o titulo de uma coluna
  updateColumn(id: number, title: string): Column {
    //fazendo a busca da coluna pelo id (esse col aqui seria o objecto column e comparamos o col.id com o id passado no parametro)
    const column = this.columns.find((col) => col.id === id);
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    column.title = title;
    return column;
  }

  //Deletar uma coluna
  deleteColumn(id: number): Column {
    //se nada for encontrado no findIndex ele retorna -1
    const column = this.columns.findIndex((col) => col.id === id);
    if (column === -1) {
      throw new NotFoundException('Column not found');
    }
    const deletedComun = this.columns.splice(column, 1);
    return deletedComun[0];
  }

  //função de criar card
  createCard(title: string, description: string, columnId: number): Card {
    const column = this.columns.find((col) => col.id === columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const newCard: Card = {
      id: this.cardIdCounter++,
      title,
      description,
      column,
    };

    column.cards.push(newCard);

    return newCard;
  }

  //atualizar o titulo ou a descrição de um card
  updateCard(cardId: number, title: string, description: string): Card {
    let cardFound: Card | undefined;
    this.columns.forEach((column) => {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) {
        cardFound = card;
      }
    });
    if (!cardFound) {
      throw new NotFoundException('Card not found');
    }
    cardFound.title = title;
    cardFound.description = description;
    return cardFound;
  }

  //deletar um card
  deleteCard(cardId: number): Card {
    let cardFound: Card | undefined;
    let columnIndex: number | undefined;
    this.columns.forEach((column, idx) => {
      const cardIndex = column.cards.findIndex((c) => c.id === cardId);
      //aqui se for diferente de -1(não encontrou algo) ele remove o card do array
      if (cardIndex !== -1) {
        cardFound = column.cards.splice(cardIndex, 1)[0];
        columnIndex = idx;
      }
    });

    if (!cardFound) {
      throw new NotFoundException('Card not found');
    }

    return cardFound;
  }
}
