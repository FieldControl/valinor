import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/graphql';
  constructor(private client: HttpClient) {}

  executeQuery(query: string, variables?: any): Observable<any> {
    const body = {
      query,
      variables,
    };

    return this.client.post<any>(this.apiUrl, body);
  }

  getColumns(): Observable<any> {
    const query = `
    query {
      getColumns {
        id
        title
        cards {
          id
          title
          description
        }
      }
    }
  `;
    return this.executeQuery(query);
  }

  createColumn(title: string): Observable<any> {
    const mutation = `
    mutation($title: String!) {
      createColumn(title: $title) {
        id
        title
      }
    }
    `;

    const variables = { title };

    return this.executeQuery(mutation, variables);
  }

  updateColumn(id: number, title: string): Observable<any> {
    const mutation = `
      mutation UpdateColumn($id: Float!, $title: String!) {
        updateColumn(id: $id, title: $title) {
          id
          title
        }
      }
    `;

    const variables = { id: Number(id), title }; // Apenas certifcando que o id é do Float igual ao back

    return this.executeQuery(mutation, variables);
  }

  deleteColumn(id: number): Observable<any> {
    const mutation = `
      mutation DeleteColumn($id: Float!) {
        deleteColumn(id: $id) {
          id
          title
        }
      } 
    `;
    return this.executeQuery(mutation, { id: Number(id) });
  }

  createCard(
    columnId: number,
    title: string,
    description: string
  ): Observable<any> {
    const mutation = `
      mutation CreateCard($columnId: Float!, $title: String!, $description: String!) {
        createCard(columnId: $columnId, title: $title, description: $description) {
          id
          title
          description
          columnId
        }
      }
    `;
    const variables = { columnId, title, description };
    return this.executeQuery(mutation, variables);
  }

  deletCard(id: number): Observable<any> {
    const mutation = `
      mutation DeleteCard($cardId: Float!) {
        deleteCard(cardId: $cardId) {
          id
        }
      }
    `;
    return this.executeQuery(mutation, { cardId: id }); 
  } 
}
