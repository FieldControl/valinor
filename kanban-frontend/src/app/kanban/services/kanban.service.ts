import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from '../models/card.model';

const GET_CARDS = gql`
  query GetCardsByColumnId($columnId: Int!) {
    getCardsByColumnId(columnId: $columnId) {
      id
      title
      description
      columnId
    }
  }
`;

const GET_CARD = gql`
  query GetCard($id: Int!) {
    getCard(id: $id) {
      id
      title
      description
      columnId
    }
  }
`;

const CREATE_CARD = gql`
  mutation CreateCard($data: CreateCardInput!) {
    createCard(data: $data) {
      id
      title
      description
      columnId
    }
  }
`;

const UPDATE_CARD = gql`
  mutation UpdateCard($data: UpdateCardInput!) {
    updateCard(data: $data) {
      id
      title
      description
      columnId
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($id: Int!) {
    deleteCard(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  constructor(private apollo: Apollo) { }

  getCardsByColumnId(columnId: number): Observable<Card[]> {
    return this.apollo.watchQuery<{ getCardsByColumnId: Card[] }>({
      query: GET_CARDS,
      variables: { columnId },
      fetchPolicy: 'network-only',
    }).valueChanges.pipe(map(result => result.data.getCardsByColumnId));
  }

  createCard(data: { title: string; description?: string; columnId: number }): Observable<Card> {
    return this.apollo.mutate<{ createCard: Card }>({
      mutation: CREATE_CARD,
      variables: { data },
    }).pipe(map(result => result.data!.createCard));
  }

  updateCardColumn(cardId: number, columnId: number): Observable<Card> {
    return this.apollo.mutate<{ updateCard: Card }>({
      mutation: UPDATE_CARD,
      variables: {
        data: { id: cardId, columnId },
      },
    }).pipe(map(result => result.data!.updateCard));
  }

  updateCard(card: Card): Observable<Card> {
    return this.apollo.mutate<{ updateCard: Card }>({
      mutation: UPDATE_CARD,
      variables: {
        data: {
          id: card.id,
          title: card.title,
          description: card.description,
          columnId: card.columnId
        },
      },
    }).pipe(map(result => result.data!.updateCard));
  }

  deleteCard(cardId: number): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_CARD,
      variables: { id: cardId },
    });
  }
}
