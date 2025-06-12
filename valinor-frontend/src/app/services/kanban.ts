import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ColumnModel } from '../models/column.model';
import { CardModel } from '../models/card.model';
import { GraphQLService } from '../core/graphql.service';

@Injectable({
  providedIn: 'root'
})
export class Kanban {
  constructor(private graphql: GraphQLService) {}

  getColumns(): Observable<ColumnModel[]> {
    const query = `
      query GetColumns {
        columns {
          id
          title
          order
          cards {
            id
            content
            order
          }
        }
      }
    `;
    
    return this.graphql.query<{ data: { columns: ColumnModel[] } }>(query).pipe(
      map(result => result.data.columns),
      catchError(error => {
        console.error('Não foi possível obter as colunas', error);
        return throwError(() => new Error('Erro ao obter colunas'));
      })
    );
  }

  getCardsByColumn(columnId: string): Observable<CardModel[]> {
    const query = `
      query GetCardsByColumn($columnId: String!) {
        cards(columnId: $columnId) {
          id
          content
          order
        }
      }
    `;
    
    return this.graphql.query<{ data: { cards: CardModel[] } }>(query, { columnId }).pipe(
      map(result => result.data.cards),
      catchError(error => {
        console.error('Não foi possível obter os cards', error);
        return throwError(() => new Error('Erro ao obter cards'));
      })
    );
  }

  createCard(columnId: string, content: string): Observable<CardModel> {
    const mutation = `
      mutation CreateCard($content: String!, $columnId: String!) {
        createCard(columnId: $columnId, content: $content) {
          id
          content
          order
          column {id title}
        }
      }
    `;
    
    return this.graphql.mutation<{ data: { createCard: CardModel } }>(mutation, { columnId, content }).pipe(
      map(result => result.data.createCard),
      catchError(error => {
        console.error('Não foi possível criar o card', error);
        return throwError(() => new Error('Erro na criação do card'));
      })
    );
  }

  updateCard(id: string, content: string): Observable<CardModel> {
    const mutation = `
      mutation UpdateCard($content: String!, $id: String!) {
        updateCard(id: $id, content: $content) {
          id
          content
          order
        }
      }
    `;
    
    return this.graphql.mutation<{ data: { updateCard: CardModel } }>(mutation, { id, content }).pipe(
      map(result => result.data.updateCard),
      catchError(error => {
        console.error('Erro completo:', error);
        return throwError(() => new Error('Erro na alteração do card'));
      })
    );
  }

  moveCard(cardId: string, newColumnId: string): Observable<CardModel> {
    const mutation = `
      mutation MoveCard($id: String!, $newColumnId: String!) {
        moveCard(id: $id, newColumnId: $newColumnId) {
          id
          content
          order
        }
      }
    `;
    
    return this.graphql.mutation<{ data: { moveCard: CardModel } }>(mutation, { id: cardId, newColumnId }).pipe(
      map(result => result.data.moveCard),
      catchError(error => {
        console.error('Não foi possível mover o card', error);
        return throwError(() => new Error('Erro ao mover o card'));
      })
    );
  }

  deleteCard(cardId: string): Observable<boolean> {
    const mutation = `
      mutation DeleteCard($id: String!) {
        deleteCard(id: $id)
      }
    `;
    
    return this.graphql.mutation<{ data: { deleteCard: boolean } }>(mutation, { id: cardId }).pipe(
      map(result => result.data.deleteCard),
      catchError(error => {
        console.error('Não foi possível deletar o card', error);
        return throwError(() => new Error('Erro ao deletar o card'));
      })
    );
  }
}
