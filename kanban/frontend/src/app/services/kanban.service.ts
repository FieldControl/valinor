import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Column } from '../models/column.model';
import { Card } from '../models/card.model';

//Serviço central para lidar com operações de Kanban via GraphQL
@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  constructor(private apollo: Apollo) {}

  //Consulta todas as colunas com seus cards
  getColumns(): Observable<Column[]> {
    return this.apollo.watchQuery<{ columns: Column[] }>({
      query: gql`
        query GetBoard {
          columns {
            id
            title
            cards {
              id
              title
              description
            }
          }
        }
      `
    }).valueChanges.pipe(map(result => result.data.columns));
  }

  //Cria uma nova coluna
  createColumn(title: string): Observable<Column> {
    return this.apollo.mutate<{ createColumn: Column }>({
      //Mutation para criar coluna com título
      mutation: gql`
        mutation CreateColumn($input: CreateColumnInput!) {
          createColumn(input: $input) {
            id
            title
            cards {
              id
              title
              description
            }
          }
        }
      `,
      //Envia o título da nova coluna
      variables: {
        input: {
          title: title,
        },
      },
      //Atualiza o board após criação
      refetchQueries: ['GetBoard'],
    }).pipe(
      //Retorna a nova coluna
      map(result => result.data!.createColumn)
    );
  }

  //Cria um novo card em uma coluna
  createCard(input: {
    title: string
    description: string
    columnId: string
  }): Observable<Card> {
    return this.apollo.mutate<{ createCard: Card }>({
      //Mutation para criar um card
      mutation: gql`
        mutation($input: CreateCardInput!) {
          createCard(input: $input) {
            id
            title
            description
            columnId
          }
        }
      `,
      //Envia os dados do card
      variables: { input },
    }).pipe(
      //Retorna o card criado
      map(result => result.data!.createCard)
    );
  }

  //Atualiza o título de uma coluna
  updateColumn(id: string, title: string): Observable<Column> {
    return this.apollo.mutate<{ updateColumn: Column }>({
      mutation: gql`
        mutation UpdateColumn($id: String!, $title: String!) {
          updateColumn(id: $id, title: $title) {
            id
            title
          }
        }
      `,
      variables: { id, title },
    }).pipe(map(result => result.data!.updateColumn));
  }

  //Remove uma coluna pelo ID
  deleteColumn(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteColumn: boolean }>({
      mutation: gql`
        mutation DeleteColumn($id: String!) {
          deleteColumn(id: $id)
        }
      `,
      variables: { id },
    }).pipe(map(result => result.data!.deleteColumn));
  }

  //Atualiza um card pelo ID
  updateCard(id: string, title: string, description: string): Observable<Card> {
    return this.apollo.mutate<{ updateCard: Card }>({
      mutation: gql`
        mutation UpdateCard($id: String!, $title: String!, $description: String!) {
          updateCard(id: $id, title: $title, description: $description) {
            id
            title
            description
            columnId
          }
        }
      `,
      variables: { id, title, description },
    }).pipe(map(result => result.data!.updateCard));
  }

  //Remove um card pelo ID
  deleteCard(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteCard: boolean }>({
      mutation: gql`
        mutation DeleteCard($id: String!) {
          deleteCard(id: $id)
        }
      `,
      variables: { id },
    }).pipe(map(result => result.data!.deleteCard));
  }

  //Move um card de uma coluna para outra
  moveCard(cardId: string, columnId: string): Observable<Card> {
    return this.apollo.mutate<{ moveCard: Card }>({
      mutation: gql`
        mutation MoveCard($cardId: String!, $columnId: String!) {
          moveCard(cardId: $cardId, columnId: $columnId) {
            id
            title
            description
            columnId
          }
        }
      `,
      variables: { cardId, columnId },
      refetchQueries: ['GetBoard'],
    }).pipe(map(result => result.data!.moveCard));
  }
}
