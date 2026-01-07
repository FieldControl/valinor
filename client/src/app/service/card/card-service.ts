import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from '../board/board-service';

interface CreateCardResponse {
  data: {
    createCard: Card;
  };
}

interface MoveCardResponse {
  data: {
    moveCard: Card;
  };
}

interface UpdateCardResponse {
  data: {
    updateCard: Card;
  };
}

interface DeleteCardResponse {
  data: {
    removeCard: Card;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor(
    private http: HttpClient
  ) {}

  private readonly apiUrl = 'http://localhost:3000/graphql';

  createCard(name: string, description: string | null, columnId: number): Observable<CreateCardResponse> {
    return this.http.post<CreateCardResponse>(this.apiUrl, {
      query: `
        mutation CreateCard($createCardInput: CreateCardInput!) {
          createCard(createCardInput: $createCardInput) {
            id
            name
            description
            columnId
          }
        }
      `,
      variables: {
        createCardInput: {
          name,
          description,
          columnId
        }
      }
    });
  }

  moveCard(cardId: number, targetColumnId: number): Observable<MoveCardResponse> {
    return this.http.post<MoveCardResponse>(this.apiUrl, {
      query: `
        mutation MoveCard($id: Int!, $targetColumnId: Int!) {
          moveCard(id: $id, targetColumnId: $targetColumnId) {
            id
            name
            description
            columnId
            createdAt
          }
        }
      `,
      variables: {
        id: cardId,
        targetColumnId
      }
    });
  }

  updateCard(id: number, name: string, description: string | null, assignedUserId?: number | null): Observable<UpdateCardResponse> {
    return this.http.post<UpdateCardResponse>(this.apiUrl, {
      query: `
        mutation UpdateCard($updateCardInput: UpdateCardInput!) {
          updateCard(updateCardInput: $updateCardInput) {
            id
            name
            description
            columnId
            assignedUserId
            assignedUserName
            createdAt
          }
        }
      `,
      variables: {
        updateCardInput: {
          id,
          name,
          description,
          ...(assignedUserId !== undefined && { assignedUserId })
        }
      }
    });
  }

  deleteCard(cardId: number): Observable<DeleteCardResponse> {
    return this.http.post<DeleteCardResponse>(this.apiUrl, {
      query: `
        mutation RemoveCard($id: Int!) {
          removeCard(id: $id) {
            id
            name
            description
            columnId
            createdAt
          }
        }
      `,
      variables: {
        id: cardId
      }
    });
  }
}
