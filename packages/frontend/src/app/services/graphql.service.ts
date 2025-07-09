import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';

interface GraphQLRequest {
  query: string;
  variables?: any;
}

interface GraphQLResponse<T = any> {
  data: T;
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private handleError = (error: any): Observable<never> => {
    console.error('GraphQL Error:', error);
    return throwError(() => error);
  };

  query<T = any>(query: string, variables?: any): Observable<T> {
    const request: GraphQLRequest = {
      query,
      variables
    };

    console.log('GraphQL Request:', {
      url: this.apiUrl,
      request
    });

    return new Observable(observer => {
      this.http.post<GraphQLResponse<T>>(this.apiUrl, request, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).subscribe({
        next: (response) => {
          console.log('GraphQL Response:', response);
          if (response.errors) {
            console.error('GraphQL Errors:', response.errors);
            observer.error(response.errors);
          } else {
            observer.next(response.data);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('HTTP Error:', error);
          observer.error(error);
        }
      });
    });
  }

  // Board queries
  getBoards(): Observable<any> {
    return this.query(`
      query GetBoards {
        boards {
          id
          title
          description
          created_at
          updated_at
        }
      }
    `);
  }

  getBoardById(id: string): Observable<any> {
    return this.query(`
      query GetBoard($id: ID!) {
        board(id: $id) {
          id
          title
          description
          columns {
            id
            title
            position
            cards {
              id
              title
              description
              position
              color
              due_date
            }
          }
        }
      }
    `, { id });
  }

  getBoardWithDetails(id: string): Observable<any> {
    return this.query(`
      query GetBoardWithDetails($id: ID!) {
        board(id: $id) {
          id
          title
          description
          columns {
            id
            title
            position
            board_id
            cards {
              id
              title
              description
              position
              color
              due_date
              column_id
            }
          }
        }
      }
    `, { id });
  }

  createBoard(title: string, description?: string): Observable<any> {
    return this.query(`
      mutation CreateBoard($input: CreateBoardInputDto!) {
        createBoard(input: $input) {
          id
          title
          description
          created_at
          updated_at
        }
      }
    `, { input: { title, description } });
  }

  deleteBoard(id: string): Observable<any> {
    return this.query(`
      mutation DeleteBoard($id: ID!) {
        deleteBoard(id: $id)
      }
    `, { id });
  }

  // Column mutations
  createColumn(boardId: string, title: string, position: number): Observable<any> {
    return this.query(`
      mutation CreateColumn($input: CreateColumnInputDto!) {
        createColumn(input: $input) {
          id
          title
          position
          board_id
        }
      }
    `, { input: { title, board_id: boardId, position } });
  }

  updateColumn(id: string, title: string): Observable<any> {
    return this.query(`
      mutation UpdateColumn($input: UpdateColumnInputDto!) {
        updateColumn(input: $input) {
          id
          title
          position
          board_id
        }
      }
    `, { input: { id, title } });
  }

  deleteColumn(id: string): Observable<any> {
    return this.query(`
      mutation DeleteColumn($id: ID!) {
        deleteColumn(id: $id)
      }
    `, { id });
  }

  // Move column for drag and drop
  moveColumn(columnId: string, newPosition: number): Observable<any> {
    return this.query(`
      mutation MoveColumn($input: MoveColumnInputDto!) {
        moveColumn(input: $input) {
          id
          title
          position
          board_id
        }
      }
    `, { input: { id: columnId, newPosition } });
  }

  // Card mutations
  createCard(columnId: string, title: string, description?: string, position?: number, color?: string): Observable<any> {
    return this.query(`
      mutation CreateCard($input: CreateCardInputDto!) {
        createCard(input: $input) {
          id
          title
          description
          position
          column_id
          color
        }
      }
    `, { input: { title, column_id: columnId, description, position, color } });
  }

  updateCard(id: string, title: string, description?: string, color?: string): Observable<any> {
    return this.query(`
      mutation UpdateCard($input: UpdateCardInputDto!) {
        updateCard(input: $input) {
          id
          title
          description
          color
          column_id
          position
        }
      }
    `, { input: { id, title, description, color } });
  }

  deleteCard(id: string): Observable<any> {
    return this.query(`
      mutation DeleteCard($id: ID!) {
        deleteCard(id: $id)
      }
    `, { id });
  }

  // Move card for drag and drop (supports column changes)
  moveCard(cardId: string, newColumnId: string, newPosition: number): Observable<any> {
    return this.query(`
      mutation MoveCard($input: MoveCardInputDto!) {
        moveCard(input: $input) {
          id
          title
          description
          color
          column_id
          position
        }
      }
    `, { input: { id: cardId, column_id: newColumnId, newPosition } });
  }
} 